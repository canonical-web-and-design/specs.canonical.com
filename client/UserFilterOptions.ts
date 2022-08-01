import qs from "qs";
import { useEffect, useState } from "react";
import { FilterOptions } from "./Filters";
import { Spec } from "./types";

type UserOptions = {
  filter: FilterOptions;
  searchQuery: string;
};

function useURLState() {
  const decodeQueryParam = (): UserOptions => {
    const searchState = qs.parse(window.location.search.substring(1)) as any;
    return {
      filter: {
        team: searchState?.filter?.team || "all",
        status: searchState?.filter?.status || [],
        type: searchState?.filter?.type || [],
        author: searchState?.filter?.author || "all",
        sortBy: searchState?.filter?.sortBy || "date",
      },
      searchQuery: searchState?.searchQuery || "",
    } as UserOptions;
  };
  const [userOptions, setUserOptions] = useState<UserOptions>(
    decodeQueryParam()
  );
  const encodeQueryParam = (options: UserOptions): string => {
    return qs.stringify(options);
  };

  useEffect(() => {
    const queryParams = encodeQueryParam(userOptions);
    const newURL = window.location.pathname + "?" + queryParams;
    history.pushState(null, "", newURL);
  }, [userOptions]);
  return { userOptions, setUserOptions };
}

export function useFilteredAndSortedSpecs(specs: Spec[]) {
  const { userOptions, setUserOptions } = useURLState();
  const unfilteredSpecs = specs;
  const [filteredSpecs, setFilteredSpecs] = useState(unfilteredSpecs);
  const [filter, setFilter] = useState<FilterOptions>(userOptions.filter);
  const [searchQuery, setSearchQuery] = useState<string>(
    userOptions.searchQuery
  );

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
    setUserOptions({ filter, searchQuery });
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
  return {
    filteredSpecs,
    filter,
    searchQuery,
    setFilter,
    setSearchQuery,
  };
}
