"use strict";

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
        valoarea: value,
      });
      arrayEurostat.push({
        tara: countries[i],
        an: years[j],
        indicator: "PIB",
        valoarea: value,
      });
    }
  }
  return arrayJsons;
}

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
    "2004",
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
  let arrayEurostat = [];
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
};
