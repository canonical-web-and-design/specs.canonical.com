import { Navigation, Theme } from "@canonical/react-components";
import Filters from "./Filters";
import Search from "./Search";
import SpecCard from "./SpecCard";
import { Spec, Team } from "./types";
import { useFilteredAndSortedSpecs } from "./UserFilterOptions";
import { sortSet } from "./utils";

export const specTypes = new Set(["Standard", "Informational", "Process"]);
export const specStatuses = new Set([
  "active",
  "Active",
  "approved",
  "braindump",
  "completed",
  "drafting",
  "obsolete",
  "pending approval",
  "rejected",
]);
function App({ specs, teams }: { specs: Spec[]; teams: Team[] }) {
  specs = specs.map((spec) => ({
    ...spec,
    title: spec.title || "Unknown title",
    index: spec.index?.length === 5 ? spec.index : "Unknown",
    status: specStatuses.has(spec.status.toLowerCase())
      ? spec.status
      : "Unknown",
    folderName: spec.folderName || "Unknown",
    type: specTypes.has(spec.type) ? spec.type : "Unknown",
    created: new Date(spec.created),
    lastUpdated: new Date(spec.lastUpdated),
  }));

  const { filteredSpecs, filter, searchQuery, setFilter, setSearchQuery } =
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
              <Search onChange={setSearchQuery} defaultValue={searchQuery} />
            </div>
          </div>
        </div>

        <div className="l-fluid-breakout__aside">
          <Filters
            authors={sortSet(authors)}
            teams={sortSet(new Set(teams))}
            onChange={setFilter}
            defaultOptions={filter}
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
