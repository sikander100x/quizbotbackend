const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseConfig.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://quizgamesystem-default-rtdb.firebaseio.com"
});

const db = admin.database();

const token = '6883476243:AAGtaBQFmuEG7aWMCZccaeSmcuBGCv9yR2U'; // Replace with your own if needed
const bot = new TelegramBot(token, { polling: true });

const adminId = 6185372844; // Only this user can approve/reject

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome to QuickQuizWin Admin Bot!');
});

bot.onText(/\/approve (.+)/, (msg, match) => {
  if (msg.from.id !== adminId) return;
  const userId = match[1];
  db.ref('users/' + userId).update({ status: 'approved' });
  bot.sendMessage(userId, '✅ Your payment has been approved!');
  bot.sendMessage(msg.chat.id, `User ${userId} approved.`);
});

bot.onText(/\/reject (.+)/, (msg, match) => {
  if (msg.from.id !== adminId) return;
  const userId = match[1];
  db.ref('users/' + userId).update({ status: 'rejected' });
  bot.sendMessage(userId, '❌ Your payment has been rejected.');
  bot.sendMessage(msg.chat.id, `User ${userId} rejected.`);
});

bot.onText(/\/users/, (msg) => {
  if (msg.from.id !== adminId) return;
  db.ref('users').once('value', (snapshot) => {
    const users = snapshot.val() || {};
    const list = Object.entries(users)
      .map(([id, data]) => `${id}: ${data.status || 'pending'}`)
      .join('\n');
    bot.sendMessage(msg.chat.id, '👥 Users:\n' + list);
  });
});
