require('dotenv').config();
const fs = require('fs');
const nodemailer = require('nodemailer');
const { parseFile } = require('@fast-csv/parse');
const handlebars = require('handlebars');

const { google } = require('googleapis');
const { Exception } = require('handlebars/runtime');
const OAuth2 = google.auth.OAuth2;

const pathToCsv = process.env.CSV_PATH;
const pathToTemplate = process.env.HTML_FILE_TO_SEND_PATH;

async function prepareTransporter() {
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const getAccessToken = () =>
    new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject('Failed to create access token :(\nerr : ' + err);
        }
        resolve(token);
      });
    });

  const accessToken = await getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  return transporter;
}

async function send() {
  const subject = process.env.SUBJECT_EMAIL;
  const idxEmail = parseInt(process.env.RECEIVER_EMAIL_IDX);
  const writeError = createWriterToFile((getFolderPath(pathToCsv) || '.') + '/error.csv');
  const templateData = JSON.parse(process.env.TEMPLATE_DATA);
  const fileBytes = fs.readFileSync(pathToTemplate, {
    encoding: 'utf8',
  });
  const template = handlebars.compile(fileBytes);

  const transporter = await prepareTransporter();
  for await (const row of csvGetRow()) {
    try {
      const receiver = row[idxEmail];
      if (!receiver) {
        throw new Error('Email index invalid');
      }
      console.log(`SENDING TO ${'-'.repeat(20)}\n${row}\n`);
      await transporter.sendMail({
        subject,
        html: compileTemplate(template, templateData, row),
        to: receiver,
      });
    } catch (error) {
      console.log('Failed to send :(');
      console.log('err : ' + error);
      writeError(row);
    }
  }
}

function getFolderPath(pathToFile) {
  const regex = /\/[\w\.]+$/;
  if (pathToFile.match(regex)) {
    return pathToFile.replace(regex, '');
  }

  return null;
}

function createWriterToFile(path) {
  return (data) =>
    fs.appendFileSync(path, data, {
      encoding: 'utf8',
    });
}

function compileTemplate(template, templateData, rowCsv) {
  const data = {};

  templateData.forEach((d) => {
    const [key, idx] = d;
    if (parseInt(idx) >= rowCsv.length) {
      throw new Exception('Index not valid');
    }
    data[key] = rowCsv[idx];
  });

  return template(data);
}

function csvGetRow() {
  return parseFile(pathToCsv, {
    headers: false,
  });
}

send();
