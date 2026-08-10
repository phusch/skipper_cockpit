(function(){
  "use strict";
  window.FSC_BUNKERING_DATA={
    schema:"fsc-bunkering-v1",
    categories:[
      {
        id:"documents",title:"Dokumente & Kontakte",icon:"▤",
        items:[
          ["personalausweis","Personalausweis"],
          ["sportbootfuehrerschein","Sportbootführerschein"],
          ["fuehrerschein","Führerschein für Auto / E-Chopper"],
          ["chartervertrag","Chartervertrag und Buchungsbestätigung"],
          ["uebergabe-inventar","Bootsübergabe- und Inventarliste"],
          ["versicherung","Versicherungsunterlagen"],
          ["vermieter-kontakt","Telefonnummer Marrenvloot / Vermieter"],
          ["notfallnummern","Notfallnummern"],
          ["hafen-bruecken-kontakte","Wichtige Hafen- und Brückennummern"],
          ["medikamentenliste","Medikamentenliste"],
          ["zahn-versicherung","Zahnbehandlungs- / Versicherungsnachweis"],
          ["karten","EC- und Kreditkarte"],
          ["bargeld","Bargeld und Münzgeld"]
        ]
      },
      {
        id:"navigation",title:"Navigation & Sicherheit",icon:"⌖",
        items:[
          ["wasserkarte","Aktuelle Friesland-Wasserkarte / Bordkarte"],
          ["schifffahrtszeichen","Schifffahrtszeichen- oder Revierführer"],
          ["fernglas","Fernglas"],
          ["garmin-64s","Garmin GPSMAP 64s"],
          ["garmin-batterien","Ersatzbatterien für Garmin"],
          ["garmin-sync","Garmin: Fahrgebietskarte und Wegpunkte synchronisieren"],
          ["gps-halter","GPS-Halterung"],
          ["handyhuelle","Wasserfeste Handyhülle"],
          ["taschenlampe","Stirn- oder Taschenlampe"],
          ["reiseapotheke","Kleine Reiseapotheke"],
          ["mueckenschutz","Mückenschutz"],
          ["pflaster-desinfektion","Pflaster und Desinfektion"],
          ["sonnencreme","Sonnencreme"],
          ["sonnenbrille","Sonnenbrille"],
          ["lesebrille","Lesebrille"],
          ["kaeppi","Käppi"]
        ]
      },
      {
        id:"electronics",title:"Elektronik & Strom",icon:"⚡",
        items:[
          ["ipad","iPad"],
          ["ipad-ladekabel","iPad-Ladekabel"],
          ["sd-reader","USB-/SD-Kartenleser"],
          ["handy-lader","Handy und Ladekabel"],
          ["mehrfachsteckdose","Mehrfachsteckdose"],
          ["usb-adapter","USB-Ladeadapter"],
          ["powerbank","USB-Powerbank"],
          ["solar-lader","Anker-Solarladegerät"],
          ["bordmusik","Bordmusik: iPad-Klinkenkabel, alternativ WLAN / Bluetooth"],
          ["kopfhoerer","Kopfhörer"],
          ["fatboy-lampen","Fatboy-Lampen mit Ladegerät"],
          ["gopro","GoPro mit Zubehör und Speicherkarte"],
          ["gopro-lader","GoPro-Ladekabel"],
          ["gimbal","Gimbal"],
          ["mavic-zoom","DJI Mavic 2 Zoom"],
          ["mavic-zubehoer","Mavic: Fernsteuerung, Akkus, Ladegerät, Ersatzpropeller und Speicherkarte"],
          ["garmin-zubehoer","Garmin-Zubehör"]
        ]
      },
      {
        id:"personal",title:"Kleidung & Persönliches",icon:"♙",
        items:[
          ["seesack","Seesack"],
          ["rucksack","Tagesrucksack"],
          ["regenjacke","Regenjacke"],
          ["regenhose","Regenhose"],
          ["fleece","Warme Jacke oder Fleece"],
          ["pullover","Pullover"],
          ["chillout-kleidung","Chillout-Kleidung"],
          ["shirts","T-Shirts"],
          ["hosen","Kurze und lange Hose"],
          ["waesche","Unterwäsche und Socken"],
          ["schlafkleidung","Schlafkleidung"],
          ["bootschuhe","Feste, rutschhemmende Schuhe"],
          ["badeschlappen","Badeschlappen"],
          ["badehose","Badehose"],
          ["badehandtuch","Badehandtuch"],
          ["huettenschlafsack","Hüttenschlafsack"],
          ["waeschebeutel","Wäschebeutel für Marinas"],
          ["kulturbeutel","Kulturbeutel"],
          ["zahnbuerste","Philips-Zahnbürste mit Ladegerät"],
          ["cpap","Schnarchomat / CPAP mit Zubehör"],
          ["medikamente","Persönliche Medikamente"],
          ["handschuhe","Leichte Handschuhe"]
        ]
      },
      {
        id:"galley",title:"Küche & Grill",icon:"♨",
        items:[
          ["kaffee-system-pruefen","Kaffeemaschine / Bordsystem vorab prüfen"],
          ["kaffeebecher","Kaffeebecher – nur falls an Bord nicht ausreichend"],
          ["glaeser","Sekt-/Weingläser – nur falls an Bord nicht ausreichend"],
          ["kessler-glaeser","Kessler-Gläser – nur falls benötigt"],
          ["sektverschluesse","Sektverschlüsse"],
          ["gemuesehobel","Gemüsehobel"],
          ["silikonhandschuhe","Silikonhandschuhe"],
          ["zip-beutel","Zip-Beutel"],
          ["kuechenrolle","Küchenrolle"],
          ["muellbeutel","Müllbeutel"],
          ["folien","Frischhalte- und Alufolie"],
          ["geschirrtuecher","Geschirrtücher"],
          ["spuelset","Spülmittel und Schwamm"],
          ["oeffner","Flaschenöffner / Korkenzieher"],
          ["gasgrill-freigabe","Lenas Gasgrill – nur nach Freigabe durch Marrenvloot"],
          ["gasgrill-set","Falls freigegeben: Gasflasche, Druckminderer, Schlauch und Grillzange"],
          ["gasgrill-sicherheit","Falls freigegeben: Feuerzeug, feuerfeste Unterlage und Reinigungszubehör"]
        ]
      },
      {
        id:"leisure",title:"Baden & Freizeit",icon:"☀",
        items:[
          ["neopren","Neoprenanzug / Fitschl"],
          ["schwimmbrille","Schwimmbrille"],
          ["badeflossen","Badeflossen"],
          ["wasserhaengematte","Wasserhängematte"],
          ["poolnudel","Poolnudel"],
          ["luftmatratze","Luftmatratze / Luma mit Pumpe"],
          ["sitzkissen","Sitzkissen"],
          ["rummikub","Brettspiel / Rummikub"],
          ["buecher","Bücher / E-Reader"],
          ["flagge","Chillout-Pirates-Friesland-Flagge"],
          ["flaggenleine","Befestigungsleine für die Flagge"],
          ["led-kerze","Romantik-Pfosten: sichere LED-Kerze"]
        ]
      },
      {
        id:"onboard",title:"Bei Bootsübernahme prüfen",icon:"✓",
        items:[
          ["schwimmwesten","Schwimmwesten in passender Anzahl und Größe"],
          ["feuerloescher","Feuerlöscher und Löschdecke"],
          ["erste-hilfe","Erste-Hilfe-Set"],
          ["rettungsmittel","Rettungsring / Rettungsmittel"],
          ["ankerausruestung","Anker und Ankerleine"],
          ["festmacher-fender","Festmacherleinen und Fender"],
          ["landstrom","Landstromkabel und Adapter"],
          ["bordgeschirr","Bordgeschirr, Gläser und Kücheninventar"],
          ["kuehlschrank","Kühlschrankkapazität und Funktion"],
          ["audioanschluss","Audioanschluss: Klinke, Bluetooth oder WLAN"],
          ["gasgrill-erlaubnis","Erlaubnis für mitgebrachten Gasgrill klären"],
          ["notfall-einweisung","Notfall-, Technik- und Toiletteneinweisung"]
        ]
      }
    ].map(category=>({...category,items:category.items.map(([id,label])=>({id,label}))}))
  };
})();
