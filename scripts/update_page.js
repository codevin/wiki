const fs = require('fs');
const _ = require('lodash');
const gql = require("graphql-tag");
const ApolloClient = require("apollo-client").ApolloClient;
const fetch = require("node-fetch");
const createHttpLink = require("apollo-link-http").createHttpLink;
const setContext = require('apollo-link-context').setContext;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const Base64 = require("js-base64").Base64

const create_gql = fs.readFileSync("../client/graph/editor/create.gql", 'utf8')
const update_gql = fs.readFileSync("../client/graph/editor/update.gql", 'utf8')

const createPageMutation = gql`${create_gql}`
const updatePageMutation= gql`${update_gql}`

// Verified working! 

let api_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjMsImdycCI6MSwiaWF0IjoxNTg5NjQ4NTk2LCJleHAiOjE2MjEyMDYxOTYsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.gocCnClPdFZDo-7pal_tU6Q0eLHpji1-GiTJEKURYj0S3yIk8NAkdiXGEF6NV7Ldd0IpmmNRWxTYNlnTjdXmTCR7c_JbeV3e75onC7E03FPjZ2QQQdNRaqgYfPhy6IzhBowqnVDnARznQ1g_6Zt0Zipq5huUaiZ3KUIfY5lR8jH-QCKbVyOpmO6BbZK_2zCKkPy9wxzVciMpHHyZEynToufs1xqjyVgZuKVQEFTBmZGV3Wsm6Ru34hibhb2Ef8c70f3aBC84P4SvfjAfXM28EbtXIK4Z0N7PfUcNCAHZ7VpYUOa69swf-vxxoJbvvN1XCEiRjLvNlaGwIvmlGgBzRA"

console.log(createPageMutation)


const httpLink = createHttpLink({
  uri: "http://127.0.0.1:3000/graphql",
  fetch: fetch
});

const authLink = setContext((_, {headers}) => {
    // get the authentication token from local storage if it exists
  const token = api_token 
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      "Authorization": token ? `Bearer ${token}` : "",
    }
  }
});


const apollo = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

/*
let continuationToken;
let jwt_cookie;

async login(username, password) {
          let resp = await apollo.mutate({
            mutation: loginMutation,
            variables: {
              username: username,
              password: password,
              strategy: 'local'   // selectedStrategy.key
            }
          })
          if (_.has(resp, 'data.authentication.login')) {
            let respObj = _.get(resp, 'data.authentication.login', {})
            if (respObj.responseResult.succeeded === true) {
              continuationToken = respObj.continuationToken
              jwt_coockie = respObj.jwt
            } else {

            }
          }
}
*/

async function create_page(path, title, content, description, tags) 
{
   let resp = await apollo.mutate({
            mutation: createPageMutation,
            variables: {
              content: content,
              title: title,
              path: path, 
              description: description || '', 
              editor: 'api', 
              locale: 'en', 
              isPrivate: false,
              isPublished: true, 
              publishEndDate: '',
              publishStartDate: '',
              tags: tags || [] 
            },
          })
    resp = _.get(resp, 'data.pages.create', {})
    if (_.get(resp, 'responseResult.succeeded')) {
       console.log("Successfully added this page. ID=", _.get(resp, 'page.id'))
    } else {
       throw new Error(_.get(resp, 'responseResult.message'))
    }
}

async function update_page(id, content, description, tags) 
{
   let resp = await apollo.mutate({
            mutation: updatePageMutation,
            variables: {
              id: id,
              content: content,
              isPublished: true,
              tags: tags || [] 
              /* title: title,
              description: description || '', 
              editor: 'api', 
              locale: 'en', 
              isPrivate: false,
              publishEndDate: '',
              publishStartDate: '' */
            },
          })
    resp = _.get(resp, 'data.pages.create', {})
    if (_.get(resp, 'responseResult.succeeded')) {
       console.log("Successfully added this page. ID=", _.get(resp, 'page.id'))
    } else {
       throw new Error(_.get(resp, 'responseResult.message'))
    }
}

update_page(10, "<h1>This is new page version 6</h1>")
   .then((result) => console.log(result))
   .catch( (err) => console.log(err) );

