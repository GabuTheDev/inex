<?php

namespace Data;

use API\Osu\User;
use API\Response;
use Debug\Timings;

class Profiles
{
    static function Get($id) {
        $x = new Timings("profiles_fetch");
        $user = \Caching::Layer("profiles_user_fetch_" . $id, function() use ($id) {
            return User::GetUser($id);
        });
        $x->finish();

        if($user == null) return new Response(false, "User not found");

        $x = new Timings("profiles_medals");
        $medals = Medals::GetAll()->content;
        $x->finish();


        $graph_medalPercentageOverTimeRelative = [];
        $graph_medalPercentageOverTimeTotal = [];

        $releaseDates = array_column($medals, 'Date_Released');
        sort($releaseDates);

        $achievedDates = array_column($user['user_achievements'], 'achieved_at');
        sort($achievedDates);

        $totalReleased = 0;
        $totalAchieved = 0;
        $r = 0;
        $a = 0;

        while ($r < count($releaseDates) || $a < count($achievedDates)) {
            $release = $releaseDates[$r] ?? PHP_INT_MAX;
            $achieved = $achievedDates[$a] ?? PHP_INT_MAX;

            if ($release <= $achieved) {
                $totalReleased++;
                $r++;
            } else {
                $totalAchieved++;
                $a++;
            }
            if ($totalAchieved < 1) continue;
            $graph_medalPercentageOverTimeRelative[] = [
                'Date' => min($release, $achieved),
                'Percentage' => round(($totalAchieved / $totalReleased) * 100, 2),
                'Achieved' => $totalAchieved,
                'Released' => $totalReleased,
            ];
        }

        $graph_medalPercentageOverTimeRelative[] = [
            'Date' => date('Y-m-d\TH:i:s\Z'),
            'Percentage' => round(($totalAchieved / $totalReleased) * 100, 2),
            'Achieved' => $totalAchieved,
            'Released' => $totalReleased,
        ];

        $deduped = [];
        foreach ($graph_medalPercentageOverTimeRelative as $point) {
            $day = substr($point['Date'], 0, 10);
            $deduped[$day] = $point;
        }
        $graph_medalPercentageOverTimeRelative = array_values($deduped);

        $totalMedals = count($releaseDates);
        $totalAchieved = 0;
        foreach ($achievedDates as $date) {
            $totalAchieved++;
            $graph_medalPercentageOverTimeTotal[] = [
                'Date' => $date,
                'Percentage' => round(($totalAchieved / $totalMedals) * 100, 2),
                'Achieved' => $totalAchieved,
                'Released' => $totalMedals,
            ];
        }

        $graph_medalPercentageOverTimeTotal[] = [
            'Date' => date('Y-m-d\TH:i:s\Z'),
            'Percentage' => round(($totalAchieved / $totalMedals) * 100, 2),
            'Achieved' => $totalAchieved,
            'Released' => $totalMedals,
        ];




        return new Response(true, "ok", [
            "User" => $user,
            "Medals" => $medals,
            "Graphs" => [
                "MedalPercentageOverTime" => [
                    "Relative" => $graph_medalPercentageOverTimeRelative,
                    "Total" => $graph_medalPercentageOverTimeTotal,
                ]
            ]
        ]);
    }
}