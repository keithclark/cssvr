const RE_MEDIA_QUERY_BLOCK = /@media\s.*?(?=\{)+/g;
const VR_CSS_TEXT = '/* CSSVR STYLES ARE INJECTED HERE */';

let vrStylesheet;

const replaceMediaType = (mq, oldMediaType, newMediaType) => {
  let re = new RegExp('(^|,\\s+)' + oldMediaType + '(?=\\s|$)', 'g');
  return mq.replace(re, '$1' + newMediaType);
}


const enableVrMediaType = mq => {
  mq = replaceMediaType(mq, 'screen', 'screen-cssvr-disabled');
  mq = replaceMediaType(mq, 'cssvr', 'screen');
  return mq;
}


const disableVrMediaType = mq => {
  mq = replaceMediaType(mq, 'screen', 'cssvr');
  mq = replaceMediaType(mq, 'screen-cssvr-disabled', 'screen');
  return mq;
}


const enableVrMediaAtRule = atRule => {
  return '@media ' + enableVrMediaType(atRule.substr(7));
}


const disableVrMediaAtRule = atRule => {
  return '@media ' + disableVrMediaType(atRule.substr(7));
}


const applyVrStyles = cssText => {
  cssText = cssText.replace(RE_MEDIA_QUERY_BLOCK, enableVrMediaAtRule);
  cssText = cssText.replace(/:hover/g, '.vr__selection');
  return cssText;
}


const removeVrStyles = cssText => {
  cssText = cssText.replace(RE_MEDIA_QUERY_BLOCK, disableVrMediaAtRule);
  cssText = cssText.replace(/\.vr__selection/g, ':hover');
  return cssText;
}


const querySelector = selectorText => {
  return Array.from(document.querySelectorAll(selectorText));
}


const toggleVrStyles = (enable) => {

  // add the vr framework styles
  if (enable) {
    if (!vrStylesheet) {
      vrStylesheet = document.createElement('style');
      vrStylesheet.textContent = VR_CSS_TEXT;
    }
    document.body.appendChild(vrStylesheet);
  } else {
    if (vrStylesheet) {
      vrStylesheet.parentElement.removeChild(vrStylesheet);
    }
  }

  // update inline stylesheets
  querySelector('style').forEach(elem => {
    if (enable) {
      elem.textContent = applyVrStyles(elem.textContent);
    } else {
      elem.textContent = removeVrStyles(elem.textContent);
    }
  });

  // update linked stylesheets
  querySelector('link[rel=stylesheet][media]').forEach(elem => {
    if (enable) {
      elem.media = enableVrMediaType(elem.media);
    } else {
      elem.media = disableVrMediaType(elem.media);
    }
  });
};


const enableVrStyles = () => {
  toggleVrStyles(true);
  return new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
};


const disableVrStyles = () => {
  toggleVrStyles(false);
  return new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
};


export { enableVrStyles, disableVrStyles };
