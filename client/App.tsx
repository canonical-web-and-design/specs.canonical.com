import { Navigation, Theme } from "@canonical/react-components";
import { useEffect, useState } from "react";
import Filters, { FilterOptions } from "./Filters";
import Search from "./Search";
import SpecCard from "./SpecCard";
import { Spec, Team } from "./types";
import { sortSet } from "./utils";

function useFilteredAndSortedSpecs(specs: Spec[]) {
  const unfilteredSpecs = specs;
  const [filteredSpecs, setFilteredSpecs] = useState(unfilteredSpecs);
  const [filter, setFilter] = useState<FilterOptions | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const sortCards = (specs: Spec[], by = "date") => {
    let direction = 1;
    let key: keyof Spec = "lastUpdated";
    if (by === "date") {
      key = "lastUpdated";
      direction = -1;
    } else if (by === "name") {
      key = "title";
    } else if (by === "index") {
      key = "index";
    }

    return specs.sort((x, y) => {
      return direction * (x[key] > y[key] ? 1 : -1);
    });
  };
  const filterByTeam = (specs: Spec[], team: string) => {
    if (team === "all") return [...specs];
    return specs.filter(
      (spec) => spec.folderName.toLowerCase() === team.toLowerCase()
    );
  };
  const filterByStatus = (specs: Spec[], statuses: string[]) => {
    if (!statuses.length) return [...specs];
    const statusesSet = new Set(statuses.map((status) => status.toLowerCase()));
    return specs.filter((spec) => statusesSet.has(spec.status.toLowerCase()));
  };
  const filterByType = (specs: Spec[], types: string[]) => {
    if (!types.length) return [...specs];
    const typesSet = new Set(types.map((type) => type.toLowerCase()));
    return specs.filter((spec) => typesSet.has(spec.type.toLowerCase()));
  };
  const filterByAuthor = (specs: Spec[], author: string) => {
    if (author === "all") return [...specs];
    return specs.filter((spec) =>
      spec.authors.find(
        (specAuthor) => specAuthor.toLowerCase() === author.toLowerCase()
      )
    );
  };

  const filterBySearchQuery = (specs: Spec[], query: string) => {
    const keys: (keyof Spec)[] = [
      "title",
      "folderName",
      "index",
      "authors",
      "type",
    ];
    if (!query) return [...specs];
    return specs.filter((spec) =>
      keys.find((key) => {
        if (Array.isArray(spec[key])) {
          return (
            (spec[key] as string[]).filter((element) =>
              element.toLowerCase().includes(query.toLowerCase())
            ).length > 0
          );
        } else {
          return (spec[key] as string)
            .toLowerCase()
            .includes(query.toLowerCase());
        }
      })
    );
  };

  useEffect(() => {
    if (!filter) {
      setFilteredSpecs(sortCards(unfilteredSpecs));
    } else {
      let filteredSpecs = filterByTeam(unfilteredSpecs, filter.team);
      filteredSpecs = filterByStatus(filteredSpecs, filter.status);
      filteredSpecs = filterByType(filteredSpecs, filter.type);
      filteredSpecs = filterByAuthor(filteredSpecs, filter.author);
      filteredSpecs = filterBySearchQuery(filteredSpecs, searchQuery);
      setFilteredSpecs(sortCards(filteredSpecs, filter.sortBy));
    }
  }, [filter, searchQuery]);
  return { filteredSpecs, setFilter, setSearchQuery };
}

export const specTypes = new Set(["Standard", "Informational", "Process"]);

function App({ specs, teams }: { specs: Spec[]; teams: Team[] }) {
  specs = specs.map((spec) => ({
    ...spec,
    title: spec.title || "Unknown title",
    index: spec.index?.length === 5 ? spec.index : "Unknown",
    status: spec.status || "Unknown",
    folderName: spec.folderName || "Unknown",
    type: specTypes.has(spec.type) ? spec.type : "Unknown",
    created: new Date(spec.created),
    lastUpdated: new Date(spec.lastUpdated),
  }));

  const { filteredSpecs, setFilter, setSearchQuery } =
    useFilteredAndSortedSpecs(specs);

  const authors = new Set<string>();
  specs.forEach((spec) =>
    spec.authors.forEach((author) => authors.add(author))
  );

  return (
    <>
      <a href="#cards" className="p-link--skip">
        Jump to main content
      </a>
      <Navigation
        logo={{
          title: "Canonical specifications",
          width: "133",
          height: "19",
          url: "/",
        }}
        theme={Theme.DARK}
      />
      <main className="l-fluid-breakout" id="main">
        <h1 className="u-off-screen">Canonical specifications</h1>
        <div className="l-fluid-breakout__toolbar u-no-margin--bottom">
          <div className="l-fluid-breakout__toolbar-items">
            <div className="l-fluid-breakout__toolbar-item">
              <span className="filtered-count"></span>
              {filteredSpecs.length}&nbsp;specs
            </div>
            <div className="l-fluid-breakout__toolbar-item">
              <Search onChange={setSearchQuery} />
            </div>
          </div>
        </div>

        <div className="l-fluid-breakout__aside">
          <Filters
            authors={sortSet(authors)}
            teams={sortSet(new Set(teams))}
            onChange={setFilter}
          />
        </div>
        <div className="l-fluid-breakout__main" id="cards">
          {filteredSpecs.length ? (
            filteredSpecs.map((spec, i) => <SpecCard key={i} spec={spec} />)
          ) : (
            <h2 id="no-results" className="u-hide u-align-text--center">
              No specs found
            </h2>
          )}
        </div>
      </main>
      <footer className="p-strip is-shallow">
        <div className="row">
          <div className="col-12">
            © {new Date().getFullYear()} Canonical Ltd. Ubuntu and Canonical are
            registered trademarks of Canonical Ltd.
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
