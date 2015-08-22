import _ from 'lodash';

class SvgToPng {
  constructor(svgNode) {
    this.svgNode = svgNode;
  }

  // TODO - Would be nice to not mutate DOM to do this
  getPng() {
    this.setSvgNodeAttributes(this.svgNode);
    return this.getSvgImage(this.svgNode.outerHTML);
  }

  setSvgNodeAttributes(svgNode) {
    svgNode.setAttribute('version', '1.1');
    svgNode.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgNode.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  }

  getSvgImage(xml) {
    return new Promise((resolve, reject) => {
      let image = new Image();
      let unicodeHappyXml = unescape(encodeURIComponent(xml));
      image.src = 'data:image/svg+xml;base64,' + window.btoa(unicodeHappyXml);

      image.onload = () => {
        let canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        let context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);

        let imageSrc = canvas.toDataURL('image/png')
                         .replace(/^data:image\/(png|jpg);base64,/, '');
        resolve(imageSrc);

      };

      image.onerror = (err) => {
        reject(err);
      };
    });
  }

  // TODO - Do I ever need this?
  appendStylesToSvgNode(svgNode) {
    let used = '';
    let sheets = document.styleSheets;
    _.each(sheets, sheet => {
      _.each(sheet.cssRules, rule => {
        if (typeof rule.style !== 'undefined' &&
            svgNode.querySelectorAll(rule.selectorText)) {
          used += `${rule.selectorText} { ${rule.style.cssText} }\n`;
        }
      });
    });

    let s = document.createElement('style');
    s.setAttribute('type', 'text/css');
    s.innerHTML = `<![CDATA[\n${used}\n]]>`;

    var defs = document.createElement('defs');
    defs.appendChild(s);
    svgNode.insertBefore(defs, svgNode.firstChild);
  }
}

export default SvgToPng;
