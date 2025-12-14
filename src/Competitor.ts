export class Competitor {
  givenName: string;
  familyName: string;
  club: string|null;
  organisationCountry: string|null;
  classNames: Set<string>;
  competitionFees: Map<number, number>;

  constructor(givenName: string, familyName: string, club: string|null, className: string, organisationCountry: string|null) {
    this.givenName = givenName;
    this.familyName = familyName;
    this.club = club;
    this.organisationCountry = organisationCountry;
    this.classNames = new Set(); // Set
    this.classNames.add(className);
    this.competitionFees = new Map<number, number>();  // eventId -> fee
  }
}

export type CompetitorList = Map<number, Competitor>;
