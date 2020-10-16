import puppeteer from "puppeteer";
import { transferDateFromDaysAgo } from "./utils/index";
const fs = require("fs");
let start = 160;
let BaseUrl = `https://www.lengdou.net/topic/${start}`;

const FAIL = [0, 1];

(async () => {
	const browser = await puppeteer.launch({
		headless: true, // false浏览器界面启动
		slowMo: 100, // 放慢浏览器执行速度，方便测试观察
		args: [
			// 启动 Chrome 的参数
			"–no-sandbox",
			// '--window-size=1280,960',
		],
	});
	let data = [];
	while (!FAIL.includes(start) && start >= 0) {
		const page = await browser.newPage();
		await page.goto(`https://www.lengdou.net/topic/${start}`, {
			// 网络空闲说明已加载完毕
			waitUntil: "networkidle2",
		});
		await page.waitForTimeout(3000);
		await console.log(`${start} page加载完成！`);
		let isHave = await page.$("body > div.container > div > div.col-md-8");
		if (!isHave) {
			console.log("err");
			start--;
		}
		// 抓取数据
		const bodyHandle = await page.$("body");
		let resOne = await page.evaluate((bodyHandle) => {
			let id = bodyHandle.querySelector(
				"#topic_list > li > div > h2 > span > a"
			).innerText;
			let via = bodyHandle.querySelector(
				"#topic_list > li > div > h2 > div > a"
			).href;
			let description = bodyHandle.querySelector(
				"#topic_list > li > div > p.topic-content"
			).innerText;
			let createdAt = bodyHandle.querySelector(
				"#topic_list > li > div > h2 > div"
			).innerText;
			let picture = bodyHandle.querySelector(
				"#topic_list > li > div > p.topic-img > img"
			).src;
			return {
				id,
				via,
				description,
				createdAt,
				picture,
			};
		}, bodyHandle);
		await console.log(`data ${resOne.id} get succeed: ${resOne.description}`);
		data.push(resOne);
		await page.waitForTimeout(2000);
		await page.close();
		if (start % 5 === 0) {
			let jsonObj = {};
			jsonObj.data = data;
			fs.writeFileSync(
				`src/data/output.json`,
				JSON.stringify(jsonObj, "", "\t"),
				(err) => {
					console.error("save error");
				}
			);
			console.log(`until ${start} saved !`);
		}
		start--;
	}
	// save
	let jsonObj = {};
	jsonObj.data = data;
	fs.writeFileSync(
		`src/data/output.json`,
		JSON.stringify(jsonObj, "", "\t"),
		(err) => {
			console.error("save error");
		}
	);
	console.log("保存成功！");
})();
