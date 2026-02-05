export class Competitor {
  givenName: string;
  familyName: string;
  club: string|null;
  organisationCountry: string|null;
  classNames: Set<string>;
  competitionFees: Map<number, EntryFees>;

  get totalFees(): number {
    return calculateSum(this.competitionFees.values());
  }


  constructor(givenName: string, familyName: string, club: string|null, className: string, organisationCountry: string|null) {
    this.givenName = givenName;
    this.familyName = familyName;
    this.club = club;
    this.organisationCountry = organisationCountry;
    this.classNames = new Set(); // Set
    this.classNames.add(className);
    this.competitionFees = new Map<number, EntryFees>();  // eventId -> fee
  }
}

function calculateSum(arr: MapIterator<EntryFees>) {
  let sum = 0;
  for (const i of arr) {
    sum += i.cardFee + i.entryFee;
  }
  return sum;
}

export type CompetitorMap = Map<number, Competitor>;
export type CompetitorList = Competitor[];

type EntryFees = {
  entryFee: number;
  cardFee: number;
}
