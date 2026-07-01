const axios = require("axios");
const cheerio = require("cheerio");

async function main() {
    const { data } = await axios.get("https://margoworld.pl/npc/elite2", {
        headers: {
            "User-Agent": "HeroBot"
        }
    });

    const $ = cheerio.load(data);

    console.log("Liczba obrazków:", $("img").length);

    $("img").slice(0, 30).each((i, img) => {
        console.log("\nIMG", i + 1);
        console.log("src:", $(img).attr("src"));
        console.log("data-src:", $(img).attr("data-src"));
        console.log("alt:", $(img).attr("alt"));
        console.log("class:", $(img).attr("class"));
    });
}

main().catch(console.error);