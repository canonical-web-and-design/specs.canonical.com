import { SearchBox } from "@canonical/react-components";
import { useEffect, useState } from "react";

const Search = ({ onChange }: { onChange: (query: string) => void }) => {
  const [query, setQuery] = useState("");
  useEffect(() => {
    onChange(query);
  }, [query]);
  return <SearchBox externallyControlled onChange={setQuery} value={query} />;
};

export default Search;
