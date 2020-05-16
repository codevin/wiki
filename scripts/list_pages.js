const gql = require("graphql-tag");
const ApolloClient = require("apollo-client").ApolloClient;
const fetch = require("node-fetch");
const createHttpLink = require("apollo-link-http").createHttpLink;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;

const httpLink = createHttpLink({
  uri: "http://127.0.0.1:3000/graphql",
  fetch: fetch
});

const apollo = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});



async function preparePageComponents(tagname) {
     // Get pages tagged with specified component. 
     const response = await apollo.query({
     query: gql`query ($tags: [String!]) {
             pages {
               list(tags: $tags) {
                  id
                  path
               }
             }
         }`,
         variables: {
            tags: [ tagname ]
         }
    });
    // Our tagged page list is in: response.data.pages.list
    let page_arr = response.data.pages.list
    let page_components_info = {}
    page_arr.map((pageinfo) => {
         let m=pageinfo.path.match(/^Components\/([a-zA-Z0-9]+\/)*([a-zA-Z0-9]+)$/)
         if (m) {
            let name = m && m[2] 
            let url = '/' + name + '.vue'
            page_components_info[url] = {
              id: pageinfo.id,
              path: pageinfo.path,
              name: name,
              url: url
            }
         } else {
            console.log("Rejecting page (Not part of Components tree): ", pageinfo.path)
         }
    })
    return page_components_info;
}


async function fetchPageVueComponent(page_id) {
         const response = await apollo.query({
           query: gql`query($id: Int!) {
                   pages {
                      single(id: $id) {
                         id
                         path
                         content
                      }
                   }
           }`,
           variables: {
                   id: page_id 
           }
         });
         const regexp = /COMPONENT([^\n]+)([^]*\n)[^\n]*ENDCOMPONENT/
         let m=response.data.pages.single.content.match(regexp)
         let content = m ? m[2] : ""
         return content
}

preparePageComponents('component')
      .then((result) => console.log(result))
      .catch((err) => console.log(err))
 
