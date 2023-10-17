# Mail Service GDSC Unsri

## Installation

```bash
git clone https://github.com/DSC-UNSRI/mail-app
cd mail-app
```

```bash
pnpm install
```

or if you using npm

```bash
npm install
```

## Usage

After installation, run this to generate .env

```bash
cp .env.example .env
```

## Env Variables Explanation

- CSV_PATH : this variable used to define the path to csv file relative to current project / workspace

- HTML_FILE_TO_SEND_PATH : this variable used to define the path to html file template that will be used as body of the email

- SUBJECT_EMAIL : this variable used to define the subject of the email

- TEMPLATE_DATA : this variable should be in array of array format, used to define the data that will be sent as context in handlebars template (See handlebars docs for complete explanation). The format should be in [key, index]. The index is based on the csv file that you defined in CSV_PATH variable, and the key is based on the template that you define in HTML_FILE_TO_SEND_PATH. Index should be number, and key should be string.

- RECEIVER_EMAIL_IDX : this variable used to define index of email in the csv file. Value should be number

- EMAIL : this is email address that you used to send emails

- GOOGLE_CLIENT_ID : this is google client id obtained from [credentials section](https://console.cloud.google.com/apis/credentials) in google cloud console

- GOOGLE_CLIENT_SECRET : this is google client secret obtained from [credentials section](https://console.cloud.google.com/apis/credentials) in google cloud console

- REFRESH_TOKEN : this is refresh token obtained from [google oauth playground](https://developers.google.com/oauthplayground)


## Usage Explanation

1. Make Email template from Google Docs and Download as .html
2. Change src attribute from image file path, to uploaded image link
3. Change to iniline-css using mailchimp: [https://templates.mailchimp.com/resources/inline-css/](https://templates.mailchimp.com/resources/inline-css/)
