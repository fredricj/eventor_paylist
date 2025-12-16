import {Competitor, type CompetitorList, type CompetitorMap} from "@/Competitor.ts";

const NS = "http://www.orienteering.org/datastandard/3.0";

const nsResolver = (prefix: string | null) => prefix === "ns" ? NS : null;

export async function retrieveEntriesFromEventorIofXml(file: File, competitors: CompetitorMap): Promise<{eventId: number, eventName: string}> {
  const xmlText = await file.text();
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const evaluator = new XPathEvaluator();

  const xpathText = (node: Node|Document, path: string) =>
    evaluator.evaluate(
      path,
      node,
      nsResolver,
      XPathResult.STRING_TYPE,
      null
    ).stringValue || null;

  const xpathNodes = (node: Node|Document, path: string) =>
    Array.from(
      (function* () {
        const result = evaluator.evaluate(
          path,
          node,
          nsResolver,
          XPathResult.ORDERED_NODE_ITERATOR_TYPE,
          null
        );
        let n;
        while ((n = result.iterateNext())) yield n;
      })()
    );

  const eventId = Number(xpathText(xml, ".//ns:Event/ns:Id"));
  const eventName = xpathText(xml, ".//ns:Event/ns:Name") as string;

  if (Number.isNaN(eventId)) {
    throw new Error("Invalid or missing Event Id");
  }

  const entries = xpathNodes(xml, ".//ns:PersonEntry");
  for (const entry of entries) {
    const competitorId = Number(xpathText(entry, ".//ns:Person/ns:Id"));
    const className = xpathText(entry, ".//ns:Class/ns:Name");
    if (!competitorId || !className) {
      continue;
    }
    if (!competitors.has(competitorId)) {
      const givenName = xpathText(entry, ".//ns:Person/ns:Name/ns:Given") ?? "";
      const familyName = xpathText(entry, ".//ns:Person/ns:Name/ns:Family") ?? "";
      const organisationName = xpathText(entry, ".//ns:Organisation/ns:ShortName") ?? "N/A";
      const organisationCountry = xpathText(entry, ".//ns:Organisation/ns:Country") ?? "N/A";
      competitors.set(
        competitorId,
        new Competitor(
          givenName,
          familyName,
          organisationName,
          className,
          organisationCountry
        )
      );
    }

    let entryFee = 0;
    const fees = xpathNodes(
      entry,
      ".//ns:AssignedFee/ns:Fee"
    );
    const competitor = competitors.get(competitorId) as Competitor;

    for (const fee of fees) {
      const amountText = xpathText(fee, ".//ns:Amount");
      let amount;
      if (amountText !== null) {
        amount = Number(amountText);
      } else {
        const percentage = Number(
          xpathText(fee, ".//ns:Percentage")
        );
        amount = (entryFee * percentage) / 100;
      }
      if (Number.isNaN(amount)) {
        throw new Error(
          `Invalid fee for ${competitor.givenName} ${competitor.familyName}`
        );
      }
      entryFee += amount;
    }
    competitor.competitionFees.set(eventId, entryFee);
    competitor.classNames.add(className);
  }

  return {eventId, eventName};
}

export async function extractFeesFromFileList(files: FileList): Promise<{events: Map<number, string>, competitors: CompetitorList}> {
  const competitorsMap = new Map<number, Competitor>();
  const events = new Map<number, string>;
  for (const file of files) {
    const {eventId, eventName} = await retrieveEntriesFromEventorIofXml(file, competitorsMap);
    events.set(eventId, eventName);
  }
  const competitors = [...competitorsMap.values()];
  return {events, competitors: competitors};
}

export function generateCSV(events: Map<number, string>, competitors: CompetitorList) {
  let csv = '';
  // Loop the array of objects
  const headers: {key: string|((obj: Competitor) => string), header: string}[] = [
    {'key': 'givenName', 'header': 'Förnamn'},
    {'key': 'familyName', 'header': 'Efternamn'},
    {'key': 'club', 'header': 'Klubb'},
    {'key': 'organisationCountry', 'header': 'Land'},
    {'key': (obj: Competitor) => [...obj.classNames].join(','), 'header': 'Klass'},
  ];
  for (const [eventId, eventName] of events.entries()) {
    headers.push({'key': (obj: Competitor) => String(obj.competitionFees.get(eventId) ?? ''), 'header': eventName, });
  }
  headers.push({'key': 'totalFees', 'header': 'Totalt'});

  const headerCount = headers.length
  for(let row = 0; row < competitors.length; row++){
    const competitor = competitors[row] as Competitor;
    if (row === 0){
      let keysCounter = 0
      for (const v of headers) {
        csv += v.header + (keysCounter+1 < headerCount ? '\t' : '\n' )
        keysCounter++
      }
    }
    let keysCounter = 0;
    for (const v of headers) {
      csv += (v.key instanceof Function ? v.key(competitor) : competitor[v.key as keyof Competitor] as string);
      csv += (keysCounter+1 < headerCount ? '\t' : '\n' );
      keysCounter++
    }
  }
  return csv;
}
