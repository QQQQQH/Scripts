// ==UserScript==
// @name        Bangumi放送站点链接
// @description 在Bangumi动画条目页左侧添加来自bgmlist.tv的放送站点链接
// @version     0.1
// @author      QQQQQH
// @include     /^https?:\/\/((bangumi|bgm).tv|chii.in)\/subject\/\d+$/
// ==/UserScript==

const BGMLIST_URL = 'https://bgmlist.com/tempapi/bangumi/$YYYY/$MM/json';
const $ = selector => document.querySelector(selector);
const sites = {
    Acfun: /acfun\.(cn|tv|tudou)/,
    Bilibili: /bilibili\.com/,
    Tucao: /tucao\.(tv|cc)/,
    搜狐: /sohu\.com/,
    优酷: /youku\.com/,
    腾讯: /qq\.com/,
    爱奇艺: /iqiyi\.com/,
    乐视: /(le|letv)\.com/,
    PPTV: /pptv\.com/,
    土豆: /tudou\.com/,
    天天看看: /kankan\.com/,
    芒果TV: /mgtv\.com/,
    Netflix: /netflix\.com/,
    Niconico: /nicovideo\.jp/
}

main();

// return on-air date [year, month] of bgm in current page
function getOnAirYearMonth() {
    const date = Array.from(document.querySelectorAll('#infobox .tip'))
        .find(t => t.textContent.match(/^(放送开始|上映年度)/));
    if (date == undefined) throw "on-air date not found";
    let [_, year, month] = date.parentElement.textContent.match(/(\d{4})年(\d{1,2})月/);
    month = month.padStart(2, '0');
    return [year, month];
}

// return bgm in cunrrent page
async function getBgm(year, month, bgmId) {
    const url = BGMLIST_URL.replace('$YYYY', year).replace('$MM', month);
    const res = await fetch(url);
    if (res.ok) {
        let list = await res.json();
        for (bgm in list) {
            if (list[bgm].bgmId == bgmId) {
                return list[bgm];
            }
        }
    }
    else {
        throw "fail to fetch bgmlist: " + res.status;
    }
    return;
}

function addInfoRow(title, links) {
    let tli = document.createElement('template');
    tli.innerHTML = '<li><span class="tip"></span></li>';
    let li = tli.content.firstChild;
    li.firstChild.textContent = `${title}：`;
    let ta = document.createElement('template');
    ta.innerHTML = '<a class="l" target="_blank"></a>';
    let a = ta.content.firstChild;
    let dot = document.createTextNode("、");

    links.forEach(([link, site]) => {
        a.href = link;
        a.innerText = site;
        li.appendChild(a.cloneNode(true));
        li.appendChild(dot.cloneNode());
    });
    li.lastChild.remove();

    let row = document.importNode(tli.content, true);
    $("#infobox").appendChild(row);
}

function addOnAirSites(bgm) {
    let links = [];
    bgm.onAirSite.forEach(link => {
        let f = false;
        for (site in sites) {
            if (sites[site].test(link)) {
                links.push([link, site]);
                f = true;
                break;
            }
        }
        if (!f) {
            links.push([link, link]);
        }
    });
    if (links.length) {
        addInfoRow('放送站点', links);
    }
    else {
        throw 'No available on-air site';
    }
}

async function main() {
    try {
        const bgmId = location.pathname.match(/\/subject\/(\d+)/)[1];
        const [year, month] = getOnAirYearMonth();
        const bgm = (await getBgm(year, month, bgmId));
        if (bgm) {
            addOnAirSites(bgm);
        }
        else {
            throw `#${bgmId} Not found in bgmlist-${year}-${month}`;
        }
    }
    catch (err) {
        console.log(`[bgm] ${err}`);
    }
}