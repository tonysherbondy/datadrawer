import $ from 'jquery';
import _ from 'lodash';
import tabletop from 'tabletop';

const urlPrefix = 'https://spreadsheets.google.com/feeds/list';
const urlPostfix = 'od6/public/values?alt=json';

class GoogleSheetsApi {
  loadSpreadsheetOld(id) {
    let url = `${urlPrefix}/${id}/${urlPostfix}`;
    let fetchSheet = Promise.resolve($.getJSON(url));

    return fetchSheet.then((sheetJson) => {
      let entries = sheetJson.feed.entry;
      let varMap = Object.create(null);

      entries.forEach(entry => {
        let columns = _.chain(entry)
                          .pairs()
                          .filter(pair => /^gsx\$/.test(pair[0]))
                          .map(pair => {
                            // Assume every value is a number and came in as a string
                            return {name: pair[0].slice(4), value: +pair[1].$t};
                          })
                          .value();
        columns.map(column => {
          // TODO - need to figure out how to handle variable length columns etc.
          let v = varMap[column.name];
          if (v) {
            v.push(column.value);
          } else {
            varMap[column.name] = [column.value];
          }
        });
      });
      return varMap;
    });
  }

  loadSpreadsheet(key) {
    return new Promise((resolve, reject) => {
      try {
        tabletop.init({simpleSheet: true, key, callback: (data) => {
          let varMap = Object.create(null);
          data.forEach(d => {
            _.keys(d).forEach(k => {
              let v = varMap[k];
              if (v) {
                v.push(+d[k]);
              } else {
                varMap[k] = [+d[k]];
              }
            });
          });
          resolve(varMap);
        }});
      } catch (e) {
        reject(e);
      }
    });
  }
}

export default GoogleSheetsApi;
