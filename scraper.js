// npm init -y
// npm install puppeteer
// npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
const fs = require('fs');
const puppeteer = require('puppeteer');

const url = 'https://www.youtube.com/watch?v=IvaJ5n5xFqU';

async function getYoutubeInfo() {

  let browser = await puppeteer.launch({ headless: true }); // launch browser
  let page = await browser.newPage();     // page variable within that page
  
  // open and goto this url / no more than 2 network connection
  await page.goto(url, { waitUntil: 'networkidle2' }); 
  
  await scrollToBottom(page);
  await page.waitFor(3000);

  let info = await page.evaluate(() => { // run this code inside of the console
    let likeList = document.querySelectorAll('yt-formatted-string[class="style-scope ytd-toggle-button-renderer style-text"]');
    let title = document.querySelector(".ytd-video-primary-info-renderer > h1").innerText;
    let date = document.querySelector("#date").querySelector('yt-formatted-string').innerText;
    let viewCount = document.querySelector(".ytd-video-view-count-renderer").innerText;
    let likeCount = likeList[0].innerText;
    let dislikeCount = likeList[1].innerText;
    let commentCount = document.querySelector('h2[id="count"]').innerText;
    let commentList = document.querySelectorAll('ytd-comment-renderer');
    let comment = []
    commentList.forEach(function (element){
        comment.push({
          author: element.querySelector('#author-text').innerText,
          publishedTime: element.querySelector(".published-time-text").innerText,
          content: element.querySelector('#content-text').innerText
        });
    });
    return {
      title,
      date,
      viewCount,
      likeCount,
      dislikeCount,
      commentCount,
      comment
    }    
  });

  await saveToCSV(info);
  
  await browser.close();
}

async function scrollToBottom(page) {
  const distance = 100; // should be less than or equal to window.innerHeight
  const delay = 100;
  while (await page.evaluate(() => document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight)) {
    await page.evaluate((y) => { document.scrollingElement.scrollBy(0, y); }, distance);
    await page.waitFor(10);
  }
}

async function saveToCSV(info) {
  await fs.writeFile("out.csv", `Title,"${info.title}"\n`, errorCheck);await new Promise(r => setTimeout(r, 1000));
  await fs.appendFile("out.csv", `Date,"${info.date}"\n`, errorCheck);await new Promise(r => setTimeout(r, 1000));
  await fs.appendFile("out.csv", `Views,"${info.viewCount}"\n`, errorCheck);await new Promise(r => setTimeout(r, 1000));
  await fs.appendFile("out.csv", `Likes,"${info.likeCount}"\n`, errorCheck);await new Promise(r => setTimeout(r, 1000));
  await fs.appendFile("out.csv", `Dislikes,"${info.dislikeCount}"\n`, errorCheck);await new Promise(r => setTimeout(r, 1000));
  await fs.appendFile("out.csv", `Comments,"${info.commentCount}"\n`, errorCheck);await new Promise(r => setTimeout(r, 1000));
  await fs.appendFile("out.csv", `\n`, errorCheck);
  for (let i = 0; i < info.comment.length; i++) {
    let comment = info.comment[i];
    await fs.appendFile("out.csv", `"${comment.author}","${comment.publishedTime}","${comment.content}"\n`, errorCheck);
    await new Promise(r => setTimeout(r, 500));
  }
}

function errorCheck(err) {
  if(err)
    console.log(err);
}

function init() {
  getYoutubeInfo();
}

init();

