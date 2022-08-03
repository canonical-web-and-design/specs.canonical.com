import { SearchBox } from "@canonical/react-components";
import { useEffect, useState } from "react";

const Search = ({
  onChange,
  defaultValue,
}: {
  onChange: (query: string) => void;
  defaultValue: string;
}) => {
  const [query, setQuery] = useState(defaultValue);
  useEffect(() => {
    onChange(query);
  }, [query]);
  return <SearchBox externallyControlled onChange={setQuery} value={query} />;
};

export default Search;
