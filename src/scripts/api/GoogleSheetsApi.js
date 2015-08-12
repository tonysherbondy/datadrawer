import $ from 'jquery';

const urlPrefix = 'https://spreadsheets.google.com/feeds/list';
const urlPostfix = 'od6/public/values?alt=json';

class GoogleSheetsApi {
  loadSpreadsheet(id) {
    let url = `${urlPrefix}/${id}/${urlPostfix}`;
    let fetchSheet = Promise.resolve($.getJSON(url));

    return fetchSheet.then((sheetJson) => {
      //if (!sheetJson) {
        //throw new Error('Google Spreadsheet not found');
      //}
      console.log('serialize google sheet', sheetJson);
    });
  }
}

export default GoogleSheetsApi;
