const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const SOURCES = [
    {
        url: "https://margoworld.pl/npc/elite2",
        category: "E2"
    },
    {
        url: "https://margoworld.pl/npc/heros",
        category: "Hero"
    },
    {
        url: "https://margoworld.pl/npc/titan",
        category: "Titan"
    },
    {
        url: "https://margoworld.pl/npc/kolos",
        category: "Colossus"
    }
];

async function parseSource(source) {

    const { data } = await axios.get(source.url,{
        headers:{
            "User-Agent":"HeroBot"
        }
    });

    const $ = cheerio.load(data);

    const bosses = [];

    $("table tr").slice(1).each((_,row)=>{

        const cells = $(row).find("td");

        if(cells.length < 3) return;

        const npc = $(cells[1]).text().replace(/\s+/g," ").trim();

        const location = $(cells[2]).text().replace(/\s+/g," ").trim();

        const match = npc.match(/^(.*?)\s*\((\d+)lvl\)$/i);

        if(!match) return;

        bosses.push({

            name: match[1],

            level: Number(match[2]),

            map: location,

            category: source.category

        });

    });

    return bosses;

}

async function main(){

    let all = [];

    for(const source of SOURCES){

        console.log("Pobieram:",source.category);

        const list = await parseSource(source);

        console.log(" ->",list.length);

        all.push(...list);

    }

    fs.writeFileSync(

        "data/bosses.json",

        JSON.stringify(all,null,2),

        "utf8"

    );

    console.log("");

    console.log("Zapisano",all.length,"bossów.");

}

main();