"use strict";

let arrayEurostat = [];

// obtinem json pentru speranta de viata
const getSV = fetch(
  "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/demo_mlexpec?precision=1&sex=T&age=Y1"
)
  .then((resp) => resp.json())
  .then(function (data) {
    return data;
  })
  .catch(function (error) {
    console.log(error);
  });

// obtinem json pentru populatie
const getPop = fetch(
  "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/demo_pjan?precision=1&sex=T&age=TOTAL"
)
  .then((resp) => resp.json())
  .then(function (data) {
    return data;
  })
  .catch(function (error) {
    console.log(error);
  });

// obtinem json pentru PIB
const getPIBPerLoc = fetch(
  "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/sdg_08_10?na_item=B1GQ&precision=1&unit=CLV10_EUR_HAB"
)
  .then((resp) => resp.json())
  .then(function (data) {
    return data;
  })
  .catch(function (error) {
    console.log(error);
  });

// se obtine valoarea in functie de query, de exemplu valoarea pentru o anumita tara intr-un anumit an in interiorul json ului
// indicatorului pe care l primim ca parametru
function getValue(jsonstat, query) {
  // indicii pentru valorile din query
  var indices = getDimIndices(jsonstat, query);

  // indexul valorii in functie de indicii gasiti mai sus pentru tara, anul, indicatorul dat
  var index = getValueIndex(jsonstat, indices);

  // returnarea valorii gasite
  return jsonstat.value[index];
}

function getDimIndices(jsonstat, query) {
  var dim = jsonstat.dimension,
    ids = jsonstat.id || dim.id;
  for (var arr = [], i = 0, len = ids.length; i < len; i++) {
    arr[i] = getDimIndex(dim, ids[i], query[ids[i]]);
  }
  return arr;
}

function getValueIndex(jsonstat, indices) {
  var size = jsonstat.size || jsonstat.dimension.size; //JSON-stat 2.0-ready

  for (var i = 0, ndims = size.length, num = 0, mult = 1; i < ndims; i++) {
    mult *= i > 0 ? size[ndims - i] : 1;
    num += mult * indices[ndims - i - 1];
  }

  return num;
}

function getDimIndex(dim, name, value) {
  if (!dim[name].category.index) {
    return 0;
  }

  var ndx = dim[name].category.index;

  // indexul poate fi object sau array
  if (Object.prototype.toString.call(ndx) !== "[object Array]") {
    return ndx[value];
  } else {
    return ndx.indexOf(value);
  }
}

// validarea jsonului conform jsonstat
function JSONstat(jsonstat) {
  if (!jsonstat) {
    window.alert("Error: no response could be retrieved.");
    return NULL;
  }

  if (!jsonstat.class) {
    jsonstat = jsonstat[Object.keys(jsonstat)[0]];
  } else {
    if (jsonstat.class !== "dataset") {
      window.alert(
        "Error: response was not a JSON-stat bundle or dataset response."
      );
      return NULL;
    }
  }

  // avem nevoie de valori si dimensiune
  if (!jsonstat.value || !jsonstat.dimension) {
    window.alert(
      "Error: response is not valid JSON-stat or does not contain required information."
    );
    return NULL;
  }

  return jsonstat;
}

function getArrayJsonsSV(arrayEurostat, countries, years, obj) {
  var jsonstat = JSONstat(obj);
  if (!jsonstat) {
    console.log("Bad format");
  }

  let arrayJsons = [];

  for (let i = 0; i < countries.length; i++) {
    for (let j = 0; j < years.length; j++) {
      var query = {
        unit: "YR",
        sex: "T",
        age: "Y1",
        geo: countries[i],
        time: years[j],
      };
      // parsarea jsonului in functie de query pentru obtinerea valorii cerute
      var value = getValue(jsonstat, query);

      arrayJsons.push({
        tara: countries[i],
        an: years[j],
        indicator: "SV",
        valoare: value,
      });
      arrayEurostat.push({
        tara: countries[i],
        an: years[j],
        indicator: "SV",
        valoare: value,
      });
    }
  }
  return arrayJsons;
}

function getArrayJsonsPop(arrayEurostat, countries, years, obj) {
  var jsonstat = JSONstat(obj);
  if (!jsonstat) {
    console.log("Bad format");
  }

  let arrayJsons = [];

  for (let i = 0; i < countries.length; i++) {
    for (let j = 0; j < years.length; j++) {
      var query = {
        unit: "NR",
        age: "TOTAL",
        sex: "T",
        geo: countries[i],
        time: years[j],
      };
      // parsarea jsonului in functie de query pentru obtinerea valorii cerute
      var value = getValue(jsonstat, query);

      arrayJsons.push({
        tara: countries[i],
        an: years[j],
        indicator: "POP",
        valoare: value,
      });
      arrayEurostat.push({
        tara: countries[i],
        an: years[j],
        indicator: "POP",
        valoare: value,
      });
    }
  }
  return arrayJsons;
}

function getArrayJsonsPIBPerLoc(arrayEurostat, countries, years, obj) {
  var jsonstat = JSONstat(obj);
  if (!jsonstat) {
    console.log("Bad format");
  }

  let arrayJsons = [];

  for (let i = 0; i < countries.length; i++) {
    for (let j = 0; j < years.length; j++) {
      var query = {
        unit: "CLV10_EUR_HAB",
        na_item: "B1GQ",
        geo: countries[i],
        time: years[j],
      };
      // parsarea jsonului in functie de query pentru obtinerea valorii cerute
      var value = getValue(jsonstat, query);

      arrayJsons.push({
        tara: countries[i],
        an: years[j],
        indicator: "PIB",
        valoare: value,
      });
      arrayEurostat.push({
        tara: countries[i],
        an: years[j],
        indicator: "PIB",
        valoare: value,
      });
    }
  }
  return arrayJsons;
}

const lineChartContainer = document.getElementById("lineChart");
const selectIndicator = document.getElementById("select-indicator");
const selectTara = document.getElementById("select-tara");
const selectAn = document.getElementById("select-an");
selectIndicator.addEventListener(
  "change",
  function () {
    if (lineChartContainer.hasChildNodes) {
      lineChartContainer.innerHTML = "";
    }
    if (this.value !== "default") {
      if (selectTara.value !== "default") {
        const lineChart = new LineChart(lineChartContainer);
        let filterArray = arrayEurostat
          .filter((el) => {
            if (el.tara === selectTara.value && el.indicator === this.value) {
              return true;
            }
            return false;
          })
          .map((el) => [el.indicator, el.an, el.valoare, el.tara]);
        lineChart.draw(filterArray);
      }
      for (let el of arrayEurostat) {
        if (el.indicator === this.value) {
          let options = selectTara.querySelectorAll("option");
          let exista = false;
          for (let opt of options) {
            if (opt.innerHTML === el.tara) exista = true;
          }
          if (!exista) {
            var opt = document.createElement("option");
            opt.value = el.tara;
            opt.innerHTML = el.tara;
            selectTara.appendChild(opt);
          }
        }
      }

      selectTara.style.visibility = "visible";
    } else {
      selectTara.value = "default";
      selectTara.style.visibility = "hidden";
      lineChartContainer.style.visibility = "hidden";
    }
  },
  false
);

selectTara.addEventListener(
  "change",
  function () {
    if (lineChartContainer.hasChildNodes) {
      lineChartContainer.innerHTML = "";
    }
    if (this.value !== "default") {
      const lineChart = new LineChart(lineChartContainer);
      let filterArray = arrayEurostat
        .filter((el) => {
          if (
            el.tara === this.value &&
            el.indicator === selectIndicator.value
          ) {
            return true;
          }
          return false;
        })
        .map((el) => [el.indicator, el.an, el.valoare, el.tara]);
      lineChart.draw(filterArray);
      lineChartContainer.style.visibility = "visible";
    } else {
      lineChartContainer.style.visibility = "hidden";
    }
  },
  false
);

let tableContainer = document.getElementById("table-container");
function createTable(filterArrayByYear) {
  let table = document.createElement("table");
  let countries = [];
  filterArrayByYear.map((el) => {
    if (!countries.includes(el.tara)) {
      countries.push(el.tara);
    }
  });

  let indicators = [];
  filterArrayByYear.map((el) => {
    if (!indicators.includes(el.indicator)) {
      indicators.push(el.indicator);
    }
  });

  let medSV =
    Math.round(
      (filterArrayByYear
        .filter((el) => el.indicator === "SV")
        .map((el) => el.valoare)
        .reduce((acc, val) => acc + val, 0) /
        countries.length) *
        10
    ) / 10;
  let medPOP = Math.round(
    filterArrayByYear
      .filter((el) => el.indicator === "POP")
      .map((el) => el.valoare)
      .reduce((acc, val) => acc + val, 0) / countries.length
  );
  let medPIB = Math.round(
    filterArrayByYear
      .filter((el) => el.indicator === "PIB")
      .map((el) => el.valoare)
      .reduce((acc, val) => acc + val, 0) / countries.length
  );
  let div = document.createElement("div");
  div.style.fontSize = "20px";
  div.style.fontWeight = "bold";
  div.style.padding = "10px";
  div.innerHTML = `Media SV: ${medSV}  -  Media POP: ${medPOP}  -  Media PIB: ${medPIB}`;
  tableContainer.appendChild(div);

  let thead = document.createElement("thead");
  let tbody = document.createElement("tbody");

  // creare table head
  let trHead = document.createElement("tr");
  let thCountry = document.createElement("th");
  thCountry.innerHTML = "Țara";
  trHead.appendChild(thCountry);
  trHead.style.border = "1px solid black";
  trHead.style.padding = "8px";
  for (let indicator of indicators) {
    let th = document.createElement("th");
    th.innerHTML = indicator;
    th.style.border = "1px solid black";
    th.style.padding = "8px";
    trHead.appendChild(th);
  }
  thead.appendChild(trHead);

  // creare table body
  for (let country of countries) {
    let tr = document.createElement("tr");
    let tdCoutry = document.createElement("td");
    tdCoutry.innerHTML = country;
    tdCoutry.style.border = "1px solid black";
    tdCoutry.style.textAlign = "left";
    tdCoutry.style.padding = "8px";
    tr.appendChild(tdCoutry);

    let countryIndicatorsObjArray = filterArrayByYear.filter(
      (el) => el.tara === country
    );
    for (let obj of countryIndicatorsObjArray) {
      let td = document.createElement("td");
      td.innerHTML = obj.valoare;
      td.style.border = "1px solid black";
      td.style.textAlign = "left";
      td.style.padding = "8px";
      if (obj.indicator === "SV") {
        if (obj.valoare > medSV) {
          td.style.backgroundColor = `rgb(0, 128, 0, ${Math.min(
            1,
            (obj.valoare - medSV) / 3
          )})`;
        } else {
          td.style.backgroundColor = `rgb(200, 0, 0, ${Math.min(
            1,
            (medSV - obj.valoare) / 3
          )})`;
        }
      } else if (obj.indicator === "POP") {
        if (obj.valoare > medPOP) {
          td.style.backgroundColor = `rgb(0, 128, 0, ${Math.min(
            1,
            (obj.valoare - medPOP) / (20 * 1000000)
          )})`;
        } else {
          td.style.backgroundColor = `rgb(200, 0, 0, ${Math.min(
            1,
            (medPOP - obj.valoare) / (20 * 1000000)
          )})`;
        }
      } else if (obj.indicator === "PIB") {
        if (obj.valoare > medPIB) {
          td.style.backgroundColor = `rgb(0, 128, 0, ${Math.min(
            1,
            (obj.valoare - medPIB) / (15 * 1000)
          )})`;
        } else {
          td.style.backgroundColor = `rgb(200, 0, 0, ${Math.min(
            1,
            (medPIB - obj.valoare) / (15 * 1000)
          )})`;
        }
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  tableContainer.appendChild(table);
}

selectAn.addEventListener(
  "change",
  function () {
    if (tableContainer.hasChildNodes) {
      tableContainer.innerHTML = "";
    }
    if (this.value !== "default") {
      // filtreaza dupa anul selectat
      let filterArrayByYear = arrayEurostat.filter(
        (el) => el.an === this.value
      );
      // craza tabelul
      createTable(filterArrayByYear);
    }
  },
  false
);

window.onload = async () => {
  let SV = await getSV;
  let Pop = await getPop;
  let PIBPerLoc = await getPIBPerLoc;

  const countries = [
    "BE",
    "BG",
    "CZ",
    "DK",
    "DE",
    "EE",
    "IE",
    "EL",
    "ES",
    "FR",
    "HR",
    "IT",
    "CY",
    "LV",
    "LT",
    "LU",
    "HU",
    "MT",
    "NL",
    "AT",
    "PL",
    "PT",
    "RO",
    "SI",
    "SK",
    "FI",
    "SE",
  ];
  const years = [
    "2005",
    "2006",
    "2007",
    "2008",
    "2009",
    "2010",
    "2011",
    "2012",
    "2013",
    "2014",
    "2015",
    "2016",
    "2017",
    "2018",
    "2019",
  ];
  let ArrayJsonsSV = getArrayJsonsSV(arrayEurostat, countries, years, SV);
  let ArrayJsonsPop = getArrayJsonsPop(arrayEurostat, countries, years, Pop);

  let ArrayJsonsPIBPerLoc = getArrayJsonsPIBPerLoc(
    arrayEurostat,
    countries,
    years,
    PIBPerLoc
  );

  const arrayEurostatToJson = JSON.stringify(arrayEurostat);
  localStorage.setItem("eurostatData", arrayEurostatToJson);

  for (let el of arrayEurostat) {
    let options = selectIndicator.querySelectorAll("option");
    let exista = false;
    for (let opt of options) {
      if (opt.innerHTML === el.indicator) exista = true;
    }
    if (!exista) {
      var opt = document.createElement("option");
      opt.value = el.indicator;
      opt.innerHTML = el.indicator;
      selectIndicator.appendChild(opt);
    }
  }

  for (let year of years) {
    let options = selectAn.querySelectorAll("option");
    let exista = false;
    for (let opt of options) {
      if (opt.innerHTML === year) exista = true;
    }
    if (!exista) {
      var opt = document.createElement("option");
      opt.value = year;
      opt.innerHTML = year;
      selectAn.appendChild(opt);
    }
  }
};

class LineChart {
  #svgns;
  #domElement;
  #svg;
  #width;
  #height;

  /**
   * @param {HTMLElement} domElement
   */
  constructor(domElement) {
    this.#domElement = domElement;
    this.#svgns = "http://www.w3.org/2000/svg";
  }

  /**
   * @param {Array<Array>} data
   */
  draw(data) {
    this.data = data;
    this.#width = this.#domElement.clientWidth;
    this.#height = this.#domElement.clientHeight;

    this.#createSVG();
    this.#drawBackground();
    this.#drawValues();
    this.#drawLines();
    this.#drawCircles();

    this.#domElement.appendChild(this.#svg);
  }
  #createSVG() {
    this.#svg = document.createElementNS(this.#svgns, "svg");

    this.#svg.setAttribute("width", this.#width);
    this.#svg.setAttribute("height", this.#height);
  }

  #drawBackground() {
    const rect = document.createElementNS(this.#svgns, "rect");
    rect.setAttribute("x", 100);
    rect.setAttribute("y", 50);
    rect.setAttribute("height", 300);
    rect.setAttribute("width", 805);

    const axeX = document.createElementNS(this.#svgns, "line");
    axeX.setAttribute("x1", 100);
    axeX.setAttribute("y1", 350);
    axeX.setAttribute("x2", 905);
    axeX.setAttribute("y2", 350);
    axeX.style.strokeWidth = "2";
    axeX.style.stroke = "black";
    this.#svg.appendChild(axeX);
    const axeY = document.createElementNS(this.#svgns, "line");
    axeY.setAttribute("x1", 100);
    axeY.setAttribute("y1", 50);
    axeY.setAttribute("x2", 100);
    axeY.setAttribute("y2", 351);
    axeY.style.strokeWidth = "2";
    axeY.style.stroke = "black";
    this.#svg.appendChild(axeY);

    rect.style.fill = "WhiteSmoke";
    this.#svg.appendChild(rect);

    const text = document.createElementNS(this.#svgns, "text");
    text.appendChild(
      document.createTextNode(`${this.data[0][0]} în ${this.data[0][3]}`)
    );
    text.setAttribute("x", 400);
    text.setAttribute("y", 30);
    text.style.fontWeight = "bold";
    this.#svg.appendChild(text);
  }

  #drawValues() {
    const textVertical = document.createElementNS(this.#svgns, "text");
    textVertical.appendChild(document.createTextNode(`${this.data[0][0]}`));
    textVertical.setAttribute("x", 30);
    textVertical.setAttribute("y", 60);

    // punere valori pe axa oy
    for (let i = 0; i <= 10; i++) {
      const element = this.data[0];
      const tspan = document.createElementNS(this.#svgns, "tspan");

      if (element[0] === "PIB") {
        tspan.innerHTML = (i * 10000).toString();
      } else if (element[0] === "POP") {
        tspan.innerHTML = (i * 10000000).toString();
      } else if (element[0] === "SV") {
        tspan.innerHTML = (i * 10).toString();
      }

      tspan.setAttribute("x", 20);
      tspan.setAttribute("y", 346 - 25 * i);
      textVertical.appendChild(tspan);
    }
    this.#svg.appendChild(textVertical);

    // punere ani pe axa ox
    const textOrizontal = document.createElementNS(this.#svgns, "text");
    textOrizontal.appendChild(document.createTextNode("Ani"));
    textOrizontal.setAttribute("x", 900);
    textOrizontal.setAttribute("y", 375);

    for (let i = this.data.length - 1; i >= 0; i--) {
      const element = this.data[i];
      const tspan = document.createElementNS(this.#svgns, "tspan");

      tspan.innerHTML = parseInt(element[1]).toString();
      tspan.setAttribute("x", 100 + 50 * i);
      tspan.setAttribute("y", 375);
      textOrizontal.appendChild(tspan);
    }
    this.#svg.appendChild(textOrizontal);
  }

  #drawCircles() {
    for (let i = 0; i <= this.data.length - 1; i++) {
      const element = this.data[i];
      const circle = document.createElementNS(this.#svgns, "circle");

      circle.setAttribute("cx", 110 + 50 * i);

      // 10.000 echiv cy 90 si 0 echiv cy 340   +90 la final intr-un interval 0 la 250
      // 100.000 ...... 250
      // 77777  ...... ?
      let cyValue = null;
      if (element[0] === "PIB") {
        cyValue = (element[2] * -250) / 100000 + 90 + 250;
      } else if (element[0] === "POP") {
        cyValue = (element[2] * -250) / 100000000 + 90 + 250;
      } else if (element[0] === "SV") {
        cyValue = (element[2] * -250) / 100 + 90 + 250;
      }
      circle.setAttribute("cy", cyValue);
      circle.setAttribute("r", 5);
      circle.style.fill = "black";
      this.#svg.appendChild(circle);

      // creare tooltip pozitionat deasupra cercului
      const tooltip = document.createElementNS(this.#svgns, "rect");
      this.#svg.appendChild(tooltip);
      tooltip.setAttribute("x", 60 + 50 * i);
      tooltip.setAttribute("y", cyValue - 65);
      tooltip.setAttribute("rx", 4);

      // creare texte de pus in tooltip
      const valueText = document.createElementNS(this.#svgns, "text");
      const yearText = document.createElementNS(this.#svgns, "text");

      valueText.setAttribute("x", 65 + 50 * i);
      valueText.setAttribute("y", cyValue - 45);
      valueText.style.fontSize = "15px";
      valueText.style.fontWeight = "bold";
      valueText.style.fill = "white";
      this.#svg.appendChild(valueText);

      yearText.setAttribute("x", 65 + 50 * i);
      yearText.setAttribute("y", cyValue - 30);
      yearText.style.fontSize = "15px";
      yearText.style.fontWeight = "bold";
      yearText.style.fill = "white";
      this.#svg.appendChild(yearText);

      circle.addEventListener(
        "mouseover",
        function (event) {
          // efect de marire pe hover
          event.target.style.fill = "grey";
          event.target.setAttribute("r", 7);

          valueText.appendChild(
            document.createTextNode(`Valoare: ${element[2]}`)
          );

          // setare lungime tooltip in functie de cel mai mare text dintre cele doua si a inaltimii cat cele doua impreuna + margini
          yearText.appendChild(document.createTextNode(`An: ${element[1]}`));
          tooltip.setAttribute(
            "height",
            valueText.getBoundingClientRect().height +
              yearText.getBoundingClientRect().height +
              10
          );
          tooltip.setAttribute(
            "width",
            Math.max(
              valueText.getBoundingClientRect().width,
              yearText.getBoundingClientRect().width
            ) + 10
          );
          tooltip.style.opacity = "0.3";
          tooltip.style.fill = "black";
        },
        false
      );

      circle.addEventListener(
        "mouseout",
        function (event) {
          // revenire la normal dupa hover
          event.target.style.fill = "black";
          event.target.setAttribute("r", 5);

          // eliminare tooltip
          tooltip.setAttribute("height", 0);
          tooltip.setAttribute("width", 0);
          tooltip.style.opacity = "0";
          tooltip.style.fill = "WhiteSmoke";

          // eliminare text din tooltip
          valueText.removeChild(valueText.lastChild);
          yearText.removeChild(yearText.lastChild);
        },
        false
      );
    }
  }

  #drawLines() {
    // desenare polyline
    const polyline = document.createElementNS(this.#svgns, "polyline");
    polyline.style.stroke = "grey";
    polyline.style.strokeWidth = "3";
    polyline.style.fill = "none";
    let points = "";
    // parcurgerea elementelor pentru setarea valorilor points pentru polyline
    for (let i = 0; i <= this.data.length - 1; i++) {
      const element = this.data[i];

      // 10.000 echiv cy 90 si 0 echiv cy 340   +90 la final intr-un interval 0 la 250
      // 100.000 ...... 250
      // 77777  ...... ?
      let cyValue = null;
      if (element[0] === "PIB") {
        cyValue = (element[2] * -250) / 100000 + 90 + 250;
      } else if (element[0] === "POP") {
        cyValue = (element[2] * -250) / 100000000 + 90 + 250;
      } else if (element[0] === "SV") {
        cyValue = (element[2] * -250) / 100 + 90 + 250;
      }
      points += `${110 + 50 * i}, ${cyValue} `;
    }
    points = points.substring(0, points.length - 1);
    polyline.setAttribute("points", points);
    this.#svg.appendChild(polyline);
  }
}
