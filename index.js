const http = require("http");
const fs = require("fs");
var requests = require("requests");

const homeFile = fs.readFileSync("home.html", "utf-8");

const replaceVal = (tempVal, orgVal) => {
    let temperature = tempVal.replace("{%tempval%}", (orgVal.main.temp - 273.15).toFixed(2));  // Convert from Kelvin to Celsius
    temperature = temperature.replace("{%tempmin%}", (orgVal.main.temp_min - 273.15).toFixed(2));
    temperature = temperature.replace("{%tempmax%}", (orgVal.main.temp_max - 273.15).toFixed(2));
    temperature = temperature.replace("{%location%}", orgVal.name);
    temperature = temperature.replace("{%country%}", orgVal.sys.country);
    return temperature;
};

const server = http.createServer((req, res) => {
    if (req.url == "/") {
        requests("https://api.openweathermap.org/data/2.5/weather?q=Ludhiana&appid=4f9f1b67ccd1c8e21588bcf93e77591c")
            .on("data", function (chunk) {
                try {
                    const objData = JSON.parse(chunk);
                    const arrData = [objData];
                    const realTimeData = arrData.map((val) => replaceVal(homeFile, val)).join("");
                    res.write(realTimeData);
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    res.write("Error processing weather data.");
                }
            })
            .on("end", function (err) {
                if (err) {
                    console.log("Connection closed due to error", err);
                    res.write("Error fetching data from API.");
                }
                res.end();
            })
            .on("error", function (err) {
                console.log("Request error", err);
                res.write("Error making request to API.");
                res.end();
            });
    } else if (req.url == "/style.css") {
        fs.readFile("style.css", "utf-8", (err, data) => {
            if (err) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found");
            } else {
                res.writeHead(200, { "Content-Type": "text/css" });
                res.write(data);
            }
            res.end();
        });
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("404 Not Found");
        res.end();
    }
});

server.listen(8000, "127.0.0.1", () => {
    console.log("Server is listening on port 8000");
});
