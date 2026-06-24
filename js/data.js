/* =====================================================================
   Static seaport / freight-hub dataset backing the Quick Quote comboboxes.
   Isolated behind searchPorts()/findPortById() so it can later be swapped
   for a live public ports API without touching the UI. `code` is a
   UN/LOCODE-style identifier; `region` groups by trade area.
   ===================================================================== */
(function () {
  'use strict';

  var PORTS = [
    { id: 'CNSHA', name: 'Shanghai', code: 'CNSHA', country: 'China', region: 'East Asia', type: 'sea' },
    { id: 'CNNGB', name: 'Ningbo-Zhoushan', code: 'CNNGB', country: 'China', region: 'East Asia', type: 'sea' },
    { id: 'CNSZX', name: 'Shenzhen', code: 'CNSZX', country: 'China', region: 'East Asia', type: 'sea' },
    { id: 'CNTAO', name: 'Qingdao', code: 'CNTAO', country: 'China', region: 'East Asia', type: 'sea' },
    { id: 'HKHKG', name: 'Hong Kong', code: 'HKHKG', country: 'Hong Kong', region: 'East Asia', type: 'sea' },
    { id: 'SGSIN', name: 'Singapore', code: 'SGSIN', country: 'Singapore', region: 'Southeast Asia', type: 'sea' },
    { id: 'KRPUS', name: 'Busan', code: 'KRPUS', country: 'South Korea', region: 'East Asia', type: 'sea' },
    { id: 'JPYOK', name: 'Yokohama', code: 'JPYOK', country: 'Japan', region: 'East Asia', type: 'sea' },
    { id: 'JPTYO', name: 'Tokyo', code: 'JPTYO', country: 'Japan', region: 'East Asia', type: 'sea' },
    { id: 'MYPKG', name: 'Port Klang', code: 'MYPKG', country: 'Malaysia', region: 'Southeast Asia', type: 'sea' },
    { id: 'MYTPP', name: 'Tanjung Pelepas', code: 'MYTPP', country: 'Malaysia', region: 'Southeast Asia', type: 'sea' },
    { id: 'VNSGN', name: 'Ho Chi Minh City (Cat Lai)', code: 'VNSGN', country: 'Vietnam', region: 'Southeast Asia', type: 'sea' },
    { id: 'THLCH', name: 'Laem Chabang', code: 'THLCH', country: 'Thailand', region: 'Southeast Asia', type: 'sea' },
    { id: 'IDTPP', name: 'Tanjung Priok (Jakarta)', code: 'IDTPP', country: 'Indonesia', region: 'Southeast Asia', type: 'sea' },
    { id: 'INNSA', name: 'Nhava Sheva (Mumbai)', code: 'INNSA', country: 'India', region: 'South Asia', type: 'sea' },
    { id: 'INMAA', name: 'Chennai', code: 'INMAA', country: 'India', region: 'South Asia', type: 'sea' },
    { id: 'LKCMB', name: 'Colombo', code: 'LKCMB', country: 'Sri Lanka', region: 'South Asia', type: 'sea' },
    { id: 'AEJEA', name: 'Jebel Ali (Dubai)', code: 'AEJEA', country: 'United Arab Emirates', region: 'Middle East', type: 'sea' },
    { id: 'SAJED', name: 'Jeddah Islamic Port', code: 'SAJED', country: 'Saudi Arabia', region: 'Middle East', type: 'sea' },
    { id: 'SADMM', name: 'King Abdulaziz Port (Dammam)', code: 'SADMM', country: 'Saudi Arabia', region: 'Middle East', type: 'sea' },
    { id: 'SARUH', name: 'Riyadh Dry Port', code: 'SARUH', country: 'Saudi Arabia', region: 'Middle East', type: 'sea' },
    { id: 'OMSOH', name: 'Sohar', code: 'OMSOH', country: 'Oman', region: 'Middle East', type: 'sea' },
    { id: 'QADOH', name: 'Hamad Port (Doha)', code: 'QADOH', country: 'Qatar', region: 'Middle East', type: 'sea' },
    { id: 'KWKWI', name: 'Shuwaikh (Kuwait)', code: 'KWKWI', country: 'Kuwait', region: 'Middle East', type: 'sea' },
    { id: 'EGPSD', name: 'Port Said', code: 'EGPSD', country: 'Egypt', region: 'North Africa', type: 'sea' },
    { id: 'EGALY', name: 'Alexandria', code: 'EGALY', country: 'Egypt', region: 'North Africa', type: 'sea' },
    { id: 'MACAS', name: 'Casablanca', code: 'MACAS', country: 'Morocco', region: 'North Africa', type: 'sea' },
    { id: 'ZADUR', name: 'Durban', code: 'ZADUR', country: 'South Africa', region: 'Africa', type: 'sea' },
    { id: 'NLRTM', name: 'Rotterdam', code: 'NLRTM', country: 'Netherlands', region: 'North Europe', type: 'sea' },
    { id: 'DEHAM', name: 'Hamburg', code: 'DEHAM', country: 'Germany', region: 'North Europe', type: 'sea' },
    { id: 'BEANR', name: 'Antwerp', code: 'BEANR', country: 'Belgium', region: 'North Europe', type: 'sea' },
    { id: 'GBFXT', name: 'Felixstowe', code: 'GBFXT', country: 'United Kingdom', region: 'North Europe', type: 'sea' },
    { id: 'GBLON', name: 'London Gateway', code: 'GBLGP', country: 'United Kingdom', region: 'North Europe', type: 'sea' },
    { id: 'FRLEH', name: 'Le Havre', code: 'FRLEH', country: 'France', region: 'West Europe', type: 'sea' },
    { id: 'ESVLC', name: 'Valencia', code: 'ESVLC', country: 'Spain', region: 'South Europe', type: 'sea' },
    { id: 'ESBCN', name: 'Barcelona', code: 'ESBCN', country: 'Spain', region: 'South Europe', type: 'sea' },
    { id: 'ITGOA', name: 'Genoa', code: 'ITGOA', country: 'Italy', region: 'South Europe', type: 'sea' },
    { id: 'GRPIR', name: 'Piraeus', code: 'GRPIR', country: 'Greece', region: 'South Europe', type: 'sea' },
    { id: 'TRMER', name: 'Mersin', code: 'TRMER', country: 'Türkiye', region: 'Mediterranean', type: 'sea' },
    { id: 'USLAX', name: 'Los Angeles', code: 'USLAX', country: 'United States', region: 'North America', type: 'sea' },
    { id: 'USLGB', name: 'Long Beach', code: 'USLGB', country: 'United States', region: 'North America', type: 'sea' },
    { id: 'USNYC', name: 'New York / New Jersey', code: 'USNYC', country: 'United States', region: 'North America', type: 'sea' },
    { id: 'USSAV', name: 'Savannah', code: 'USSAV', country: 'United States', region: 'North America', type: 'sea' },
    { id: 'USHOU', name: 'Houston', code: 'USHOU', country: 'United States', region: 'North America', type: 'sea' },
    { id: 'CAVAN', name: 'Vancouver', code: 'CAVAN', country: 'Canada', region: 'North America', type: 'sea' },
    { id: 'MXZLO', name: 'Manzanillo', code: 'MXZLO', country: 'Mexico', region: 'Latin America', type: 'sea' },
    { id: 'BRSSZ', name: 'Santos', code: 'BRSSZ', country: 'Brazil', region: 'Latin America', type: 'sea' },
    { id: 'PACTB', name: 'Colón (Balboa)', code: 'PABLB', country: 'Panama', region: 'Latin America', type: 'sea' },
    { id: 'AUSYD', name: 'Sydney (Port Botany)', code: 'AUSYD', country: 'Australia', region: 'Oceania', type: 'sea' },
    { id: 'AUMEL', name: 'Melbourne', code: 'AUMEL', country: 'Australia', region: 'Oceania', type: 'sea' },
    { id: 'AEDXB', name: 'Dubai Intl Airport (Air)', code: 'DXB', country: 'United Arab Emirates', region: 'Middle East', type: 'air' },
    { id: 'SARUHAIR', name: 'Riyadh — King Khalid (Air)', code: 'RUH', country: 'Saudi Arabia', region: 'Middle East', type: 'air' },
    { id: 'DEFRA', name: 'Frankfurt Airport (Air)', code: 'FRA', country: 'Germany', region: 'North Europe', type: 'air' },
    { id: 'HKHKGAIR', name: 'Hong Kong Intl (Air)', code: 'HKG', country: 'Hong Kong', region: 'East Asia', type: 'air' }
  ];

  function norm(s) {
    return String(s).toLowerCase().trim();
  }

  // Search the local port dataset. Replace with a network call to a public
  // ports API to go live — the combobox UI is unaffected.
  function searchPorts(query, limit) {
    if (limit == null) limit = 8;
    var q = norm(query);
    if (!q) return PORTS.slice(0, limit);
    return PORTS.filter(function (p) {
      return (
        norm(p.name).indexOf(q) !== -1 ||
        norm(p.code).indexOf(q) !== -1 ||
        norm(p.country).indexOf(q) !== -1 ||
        norm(p.region).indexOf(q) !== -1
      );
    }).slice(0, limit);
  }

  function findPortById(id) {
    for (var i = 0; i < PORTS.length; i++) {
      if (PORTS[i].id === id) return PORTS[i];
    }
    return undefined;
  }

  window.SilahData = {
    PORTS: PORTS,
    searchPorts: searchPorts,
    findPortById: findPortById
  };
})();
