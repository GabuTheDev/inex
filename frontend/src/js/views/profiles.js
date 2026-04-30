import "../../css/views/profiles.css";
import {Graph} from "../ui/graph";
import {Clubs} from "../utils/clubs";
import MedalBatchData from "../data/MedalBatchData";
import {DoRequest} from "../utils/requests";
import {renderDebugTimings} from "../layout/debug";
import {ContentError} from "../ui/error";
import {D2} from "../utils/d2";


async function Load() {
    let profiles = await DoRequest("POST", "/api/profiles/" + profileID)
    console.log(profiles);
    if(profiles == null || profiles.success == false || typeof(profiles.content) == "undefined") {
        console.error(profiles.message);
        new ContentError("This user does not exist", "Please make sure the URL is correct", null, null, [
            {
                "text": "Profiles Home",
                "href": "/profiles"
            }
        ]);
        return;
    }
    //renderDebugTimings(profiles.timings);
    profiles = profiles.content;

    document.getElementById("profiles-header-img").appendChild(D2.Image("", profiles.User.cover_url))
    document.getElementById("profiles-header-img").appendChild(D2.Image("blurred", profiles.User.cover_url))

    for(let el of document.querySelectorAll("[pr-el=pfp]")) {
        el.src = profiles.User.avatar_url;
    }
    for(let el of document.querySelectorAll("[pr-el=username]")) {
        el.innerText = profiles.User.username;
    }
    for(let el of document.querySelectorAll("[pr-el=flag]")) {
        el.src = "/assets/flags/4x3/" + profiles.User.country.code.toLowerCase() + ".svg";
    }
    for(let el of document.querySelectorAll("[pr-el=country]")) {
        el.innerText = profiles.User.country.name;
    }

    for(let el of document.querySelectorAll("[pr-el=gamemode-icon]")) {
        el.className = "icon-gamemode-" + profiles.User.playmode;
    }
    for(let el of document.querySelectorAll("[pr-el=gamemode-rank]")) {
        el.innerText = profiles.User.statistics.global_rank;
    }

    for(let el of document.querySelectorAll("[pr-el=panel-allmode]")) {
        // we don't have this data yet
        let outer = D2.Div("panel-stats panel-allmode-outer", () => {
            D2.Text("p", "All-Mode");
            D2.StyledText("h1", `<strong>#${0}</strong> Global`);
            D2.StyledText("h3", `<strong>#${0}</strong> Country`);
            D2.Div("footerarea", () => {
                D2.StyledText("p", `<strong>${0}</strong>spp`);
                D2.StyledText("p", `<strong>${0}%</strong> acc`);
            })
        });
        el.innerHTML = "";
        el.appendChild(outer);
    }
    for(let el of document.querySelectorAll("[pr-el=panel-medals]")) {
        let percentage = profiles.User.user_achievements.length / profiles.Medals.length;
        percentage = Math.round(percentage * 10000)/100;
        let club = Clubs.GetClub(percentage)
        let outer = D2.Div("panel-stats panel-medals-outer col" + club + "club", () => {
            D2.Image("rank-image", "/public/img/clubs/" + club + ".png", "medal")
            D2.Text("p", "Medals");
            D2.StyledText("h1", `<strong>${club}% Club</strong>`);
            // we don't have this data yet
            D2.StyledText("h3", `<strong>#${0}</strong> Global`)
            D2.Div("footerarea", () => {
                D2.StyledText("p", `<strong>${profiles.User.user_achievements.length} medals</strong> (${percentage}%)`);
                // TODO: progress bar
            })
        });
        el.innerHTML = "";
        el.appendChild(outer);
    }






    function forwardFill(data) {
        const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        const filled = [];

        for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i];
            const nextTs = new Date(sorted[i + 1].date).getTime();
            let ts = new Date(current.date).getTime();

            while (ts < nextTs) {
                filled.push({
                    ...current,
                    date: new Date(ts).toISOString()
                });
                ts += 86400000;
            }
        }
        filled.push(sorted[sorted.length - 1]);
        return filled;
    }

    let container = document.getElementById('medal-graph');
    const graph = new Graph(container);
    graph.renderTooltip = d => `<small>${d.date}</small><h1>${d.value}%</h1><h3>(${d.achieved}/${d.released} medals)</h3>`;
    graph.defaultColour = '#800000';
    graph.events = [];

    for (let event of MedalBatchData) {
        graph.events.push({
            type: "event",
            title: event.name,
            date: event.date
        })
    }


    let data = profiles.Graphs.MedalPercentageOverTime.Relative.map(d => ({
        date: d.Date,
        value: d.Percentage,
        achieved: d.Achieved,
        released: d.Released
    }));

    for (let dataitem of data) {
        graph.events.push({
            type: "colour",
            colour: Clubs.GetClubColour(Clubs.GetClub(dataitem.value)),
            date: dataitem.date
        })
    }
    console.log(data);
    graph.load(data);
}
Load();