import { GraphQLClient } from "graphql-request";

export function getGitHubClient(accessToken) {
  return new GraphQLClient("https://api.github.com/graphql", {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
}