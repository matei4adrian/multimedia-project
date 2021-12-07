"use strict";

let arrayEurostat = [];

// obtinem json pentru speranta de viata
const getSV = fetch(
  "http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/demo_mlexpec?precision=1&sex=T&age=Y1"
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
  "http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/demo_pjan?precision=1&sex=T&age=TOTAL"
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
  "http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/sdg_08_10?na_item=B1GQ&precision=1&unit=CLV10_EUR_HAB"
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
      document.createTextNode(`${this.data[0][0]} in ${this.data[0][3]}`)
    );
    text.setAttribute("x", 400);
    text.setAttribute("y", 30);
    text.style.fontWeight = "bold";
    this.#svg.appendChild(text);
  }

  #drawValues() {
    const textVerical = document.createElementNS(this.#svgns, "text");
    textVerical.appendChild(document.createTextNode(`${this.data[0][0]}`));
    textVerical.setAttribute("x", 30);
    textVerical.setAttribute("y", 60);

    // punere valori
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
      textVerical.appendChild(tspan);
    }
    this.#svg.appendChild(textVerical);

    // punere ani
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

      circle.addEventListener(
        "mouseover",
        function (event) {
          event.target.style.fill = "grey";
          event.target.setAttribute("r", 7);
        },
        false
      );

      circle.addEventListener(
        "mouseout",
        function (event) {
          event.target.style.fill = "black";
          event.target.setAttribute("r", 5);
        },
        false
      );
    }
  }

  #drawLines() {
    const polyline = document.createElementNS(this.#svgns, "polyline");
    polyline.style.stroke = "grey";
    polyline.style.strokeWidth = "3";
    polyline.style.fill = "none";
    let points = "";
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
