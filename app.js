const path = require("path");
const OpenAI = require("openai");
require("dotenv").config({
  path: path.resolve(__dirname, "./.env"),
});
const { OPENAI_API_KEY } = process.env;
const readline = require("readline");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY }); // 這裡需要根據您的設置來初始化

// 創建一個用於讀取終端機輸入的接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 使用者輸入問題的函數
function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  const emptyThread = await openai.beta.threads.create();
  console.log(emptyThread);
  const threadId = emptyThread.id;

  while (true) {
    // 使用無窮循環，直到用戶選擇退出
    const userQuestion = await askQuestion(
      '請輸入您的問題 (輸入 "exit" 來結束): '
    );

    if (userQuestion.toLowerCase() === "exit") {
      console.log("結束對話。");
      break;
    }

    const threadMessages = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userQuestion,
    });

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: "asst_OGuQSf27UksHzjjkEE5tkJCw",
    });

    const runID = run.id;
    let runstatus;
    do {
      const retrieveRun = await openai.beta.threads.runs.retrieve(
        threadId,
        runID
      );
      runstatus = retrieveRun.status;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } while (runstatus !== "completed");

    const message = await openai.beta.threads.messages.list(threadId);

    // 假設我們處理第一條消息的第一個 content 元素
    const value = message.data[0].content[0].text.value;

    // 使用正則表達式來移除類似於 &#8203;``【oaicite:0】``&#8203; 的模式
    const cleanedValue = value.replace(/【\d+†source】/g, "");

    console.log("Cleaned Value:", cleanedValue);
  }

  rl.close();
}

main();
