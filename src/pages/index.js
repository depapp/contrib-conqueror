import { useSession, signIn, signOut } from "next-auth/react";
import { getGitHubClient } from "../utils/githubClient";
import { useEffect, useState } from "react";

export default function Profile() {
  const { data: session } = useSession();
  const [data, setData] = useState([]);
  const [endCursor, setEndCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [sortOption, setSortOption] = useState("stars");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      document.title = `ContribConqueror - ${session.user.name}`;
    } else {
      document.title = "ContribConqueror";
    }
  }, [session]);

  const fetchData = async (cursor = null) => {
    if (session) {
      setLoading(true);
      const client = getGitHubClient(session.accessToken);
      const query = `
        query ($cursor: String, $states: [PullRequestState!]) {
          viewer {
            login
            name
            avatarUrl
            pullRequests(first: 100, after: $cursor, states: $states, orderBy: {field: CREATED_AT, direction: DESC}) {
              nodes {
                title
                repository {
                  name
                  owner {
                    login
                  }
                  stargazerCount
                }
                url
                createdAt
                state
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        }
      `;
      const variables = { cursor, states: statusFilter === "ALL" ? undefined : [statusFilter] };
      const response = await client.request(query, variables);
      const newPullRequests = response.viewer.pullRequests.nodes;

      // Filter out pull requests from repositories owned by the logged-in user
      const filteredPullRequests = newPullRequests.filter(pr => pr.repository.owner.login !== response.viewer.login);

      setData((prevData) => (cursor ? [...prevData, ...filteredPullRequests] : filteredPullRequests));
      setEndCursor(response.viewer.pullRequests.pageInfo.endCursor);
      setHasNextPage(response.viewer.pullRequests.pageInfo.hasNextPage);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, statusFilter]);

  const sortData = (data) => {
    switch (sortOption) {
      case "stars":
        return data.sort((a, b) => b.repository.stargazerCount - a.repository.stargazerCount);
      case "latest":
        return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "oldest":
        return data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return data;
    }
  };

  const groupByRepository = (data) => {
    return data.reduce((acc, pr) => {
      const repoName = pr.repository.name;
      if (!acc[repoName]) {
        acc[repoName] = {
          stargazerCount: pr.repository.stargazerCount,
          pullRequests: []
        };
      }
      acc[repoName].pullRequests.push(pr);
      return acc;
    }, {});
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">You are not signed in</p>
        <button
          onClick={() => signIn("github")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          data-umami-event="klik-button-login"
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  const sortedData = sortData(data);
  const groupedData = groupByRepository(sortedData);

  return (
    <div className="container mx-auto p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">
        GitHub Contributions to Open-Source Projects - {session.user.name}
      </h1>
      <div className="flex items-center mb-4">
        <img
          src={session.user.image}
          alt="GitHub Avatar"
          className="w-16 h-16 rounded-full mr-4"
        />
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          data-umami-event="klik-button-logout"
        >
          Sign out
        </button>
      </div>
      <div className="mb-4">
        <label htmlFor="sort" className="mr-2">Sort by:</label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="px-2 py-1 border rounded text-gray-900 dark:text-gray-900"
          data-umami-event={`klik-button-sort-by-${sortOption}`}
        >
          <option value="stars">Star Count</option>
          <option value="latest">Latest PR</option>
          <option value="oldest">Oldest PR</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="status" className="mr-2">Filter by Status:</label>
        <select
          id="status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2 py-1 border rounded text-gray-900 dark:text-gray-900"
          data-umami-event={`klik-button-filter-by-${statusFilter}`}
        >
          <option value="ALL">All</option>
          <option value="OPEN">Open</option>
          <option value="MERGED">Merged</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
        </div>
      ) : (
        Object.keys(groupedData).length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">GitHub Contributions</h2>
            <ul className="space-y-4">
              {Object.keys(groupedData).map((repoName) => (
                <li key={repoName} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                  <strong className="block mb-2">• {repoName} [🌟 {groupedData[repoName].stargazerCount}]</strong>
                  <ul className="list-disc list-inside">
                    {groupedData[repoName].pullRequests.map((pr, index) => (
                      <li key={index} className="ml-4">
                        <a
                          href={pr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 dark:text-blue-400 hover:underline"
                        >
                          {pr.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            {hasNextPage && (
              <button
                onClick={() => fetchData(endCursor)}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Load More
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
}
