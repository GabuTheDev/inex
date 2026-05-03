<?php

namespace Polldata;

use API\Response;
use Database\Session;

class P1_Hardware
{
    static $categories = [
        "peripherals" => [
            "title" => "Peripherals",
            "categories" => [
                "drawing-tablet" => ["title" => "Drawing Tablet"],
                "tablet-pen"     => ["title" => "Tablet Pen"],
                "mouse"          => ["title" => "Mouse"],
                "keyboard"       => ["title" => "Keyboard"],
                "keypad"         => ["title" => "Keypad"],
                "monitor"        => ["title" => "Monitor"],
            ]
        ],
        "audio" => [
            "title" => "Audio",
            "categories" => [
                "headphones" => ["title" => "Headphones/Earphones/Etc"],
                "dac-amp"    => ["title" => "DAC / Amp"],
            ]
        ],
        "pc" => [
            "title" => "PC",
            "categories" => [
                "gpu" => ["title" => "GPU"],
                "cpu" => ["title" => "CPU"],
                "os"  => ["title" => "Operating System"],
            ]
        ],
        "other" => [
            "title" => "Other",
            "note" => "Please only fill them in if you use the devices to play osu!",
            "categories" => [
                "touchscreen" => ["title" => "Touchscreen"],
                "phone"       => ["title" => "Phone"],
                "tablet"      => ["title" => "Tablet"],
                "other"       => ["title" => "Other"],
            ]
        ]
    ];

    static function Submit() {
        if (!\Database\Session::LoggedIn()) {
            return new Response(false, "Not logged in");
        }

        $body = $_POST['categories'];

        $expected = \Polldata\P1_Hardware::$categories;

        foreach ($expected as $catKey => $cat) {
            if (!isset($body[$catKey]) || !is_array($body[$catKey])) {
                return new Response(false, "Invalid body");
            }
            foreach ($cat['categories'] as $itemKey => $item) {
                if (!isset($body[$catKey]['categories'][$itemKey])) {
                    return new Response(false, "Invalid body");
                }
                $responses = $body[$catKey]['categories'][$itemKey]['responses'] ?? null;
                $notes     = $body[$catKey]['categories'][$itemKey]['notes']     ?? null;
                if (!is_array($responses) || !is_string($notes)) {
                    return new Response(false, "Invalid body");
                }
                foreach ($responses as $response) {
                    if (!is_string($response)) {
                        return new Response(false, "Invalid body");
                    }
                }
            }
        }

        \Database\Connection::execOperation(
            "INSERT INTO Forms_Responses (Form_ID, User_ID, Data, Responded_At) VALUES (1, ?, ?, NOW())",
            "is",
            [Session::UserData()['id'], json_encode($body)]
        );

        return new Response(true, "Submitted!");
    }
}