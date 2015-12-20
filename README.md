# pouchdb-admins

> PouchDB plugin to simulate CouchDB’s admin accounts

[![Build Status](https://travis-ci.org/hoodiehq/pouchdb-admins.svg?branch=master)](https://travis-ci.org/hoodiehq/pouchdb-admins)
[![Coverage Status](https://coveralls.io/repos/hoodiehq/pouchdb-admins/badge.svg?branch=master)](https://coveralls.io/r/hoodiehq/pouchdb-admins?branch=master)
[![Dependency Status](https://david-dm.org/hoodiehq/pouchdb-admins.svg)](https://david-dm.org/hoodiehq/pouchdb-admins)
[![devDependency Status](https://david-dm.org/hoodiehq/pouchdb-admins/dev-status.svg)](https://david-dm.org/hoodiehq/pouchdb-admins#info=devDependencies)

`pouchdb-admins` mimics how CouchDB stores a map of admin accounts in its configuration.

## Example

```js
var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-admins'))

var db = new PouchDB('my-users')

var admins = db.admins({
  secret: 'secret123'
})

admins.get('kim').then(function (doc) {
  console.log('"%s" is an admin', doc.name)
})

admins.validatePassword('pat', 'secret').then(function () {
  // "pat" is admin and "secret" is correct password
})

admins.on('change', function (adminMap) {
  // adminMap is all admins with their hashed password
  // {
  //   "kim": "-pbkdf2-e079757b4cb58ae17467c8befe725778ce97e422,0aef36ccafa33f3e81ae897baf23f85c,10"
  // }
})
admins.on('add', function (username) {
  console.log('%s added as admin', username)
})
admins.on('update', function (username) {
  console.log('password updated for %s', username)
})
admins.on('remove', function (username) {
  console.log('%s removed from admins', username)
})
```

## API

- [Factory](#factory)
- [get()](#adminsget)
- [set()](#adminsset)
- [validatePassword()](#adminsvalidatepassword)
- [calculateSessionId()](#adminscalculatesessionid)
- [validateSession()](#adminsvalidatesession)
- [Events](#events)

### Factory

```js
db.admins(options)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>options.secret</code></th>
    <td>String</td>
    <td>
      Server secret, like CouchDB’s <code>couch_httpd_auth.secret</code>
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left"><code>options.admins</code></th>
    <td>Object</td>
    <td>
      Map of existing admin accounts
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left"><code>options.sessionTimeout</code></th>
    <td>Number</td>
    <td>
      Default timeout for sessions in milliseconds, used in
      <code>.calculateSessionId</code>
    </td>
    <td>No</td>
  </tr>
</table>

Returns `admins` API.

Throws

<table>
  <tr>
    <th align="left"><code>TypeError</code></th>
    <td><code>options.secret</code> is not a String</td>
  </tr>
</table>

Example

```js
var admins = db.admins({
  secret: 'secret123',
  admins: {
    kim: '-pbkdf2-e079757b4cb58ae17467c8befe725778ce97e422,0aef36ccafa33f3e81ae897baf23f85c,10'
  }
})
```

### admins.get()

Looks up admin account by username

```js
admins.get(username)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>username</code></th>
    <td>String</td>
    <td>
      -
    </td>
    <td>Yes</td>
  </tr>
</table>

Resolves without doc for admin as if it would be stored in CouchDB’s `_users`
but without a `_rev` property.

```js
{
  id: 'org.couchdb.user:kim',
  type: 'user',
  name: 'kim',
  password_scheme: 'pbkdf2',
  derived_key: 'e079757b4cb58ae17467c8befe725778ce97e422',
  salt: '0aef36ccafa33f3e81ae897baf23f85c',
  iterations: 10,
  roles: ['_admin']
}
```

Rejects with

<table>
  <tr>
    <th align="left"><code>TypeError</code></th>
    <td><code>username</code> is not a String</td>
  </tr>
  <tr>
    <th align="left"><code>not_found</code></th>
    <td>admin not found</td>
  </tr>
</table>

Example

```js
admins.get('kim')
  .then(function () {
    console.log('"kim" is an admin')
  })
  .catch(function (error) {
    if (error.name === 'not_found') {
      console.log('"kim" is not an admin')
    } else {
      // something unforeseen happened
      console.log(error)
    }
  })
```

Session validation example

```js
var isValidSessionId = require('couchdb-is-valid-session-id')
admins.get('kim')
  .then(function (doc) {
    if (!isValidSessionId('secret123', doc.salt, sessionId)) {
      throw new Error('Invalid sesion')
    }

    // kim has valid session
  })
```

### admins.set()

Adds or updates admin password

```js
admins.set(username, password)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>username</code></th>
    <td>String</td>
    <td>
      -
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left"><code>password</code></th>
    <td>String</td>
    <td>
      -
    </td>
    <td>Yes</td>
  </tr>
</table>

Resolves without argument. Rejects with

<table>
  <tr>
    <th align="left"><code>TypeError</code></th>
    <td><code>username</code> is not a String</td>
  </tr>
  <tr>
    <th align="left"><code>TypeError</code></th>
    <td><code>password</code> is not a String</td>
  </tr>
</table>

Example

```js
admins.set('pat', 'secret')
  .then(function () {
    // pat added as admin with hashed password, or existing password updated
  })
```

### admins.validatePassword

Validates password of admin account

```js
admins.validatePassword(username, password)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>username</code></th>
    <td>String</td>
    <td>
      -
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left"><code>password</code></th>
    <td>String</td>
    <td>
      -
    </td>
    <td>Yes</td>
  </tr>
</table>

Resolves without argument. Rejects with

<table>
  <tr>
    <th align="left"><code>TypeError</code></th>
    <td><code>username</code> is not a String</td>
  </tr>
  <tr>
    <th align="left"><code>TypeError</code></th>
    <td><code>password</code> is not a String</td>
  </tr>
  <tr>
    <th align="left"><code>not_found</code></th>
    <td>missing</td>
  </tr>
  <tr>
    <th align="left"><code>unauthorized</code></th>
    <td>Name or password is incorrect</td>
  </tr>
</table>

Example

```js
admins.validatePassword('pat', 'secret')
  .then(function () {
    // "pat" is admin and "secret" is correct password
  })
  .catch(function (error) {
    switch (error.name) {
      case 'unauthorized':
        // "pat" is admin but "secret" is incorrect password
        break
      case 'not_found':
        // "pat" is not an admin
        break
      default:
        // something unforeseen happened ...
        console.log(error)
    }
  })
```

### calculateSessionId()

_tbd_

### validateSession()

_tbd_

### Events

`admins` is an [event emitter](https://nodejs.org/api/events.html) and exposes
all methods `.on`, `once`, `.removeListener` etc.

<table>
  <thead>
    <tr>
      <th>
        Event
      </th>
      <th>
        Description
      </th>
      <th>
        Argument
      </th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>change</code></th>
    <td>
      triggered for any <code>add</code>, <code>update</code> and <code>remove</code> event
    </td>
    <td>
      <code>adminsMap</code> of all admin accounts with hashed password
    </td>
  </tr>
  <tr>
    <th align="left"><code>add</code></th>
    <td>
      New admin account created
    </td>
    <td>
      <code>username</code> of new admin account
    </td>
  </tr>
  <tr>
    <th align="left"><code>update</code></th>
    <td>
      Existing admin account updated
    </td>
    <td>
      <code>username</code> of updated admin account
    </td>
  </tr>
  <tr>
    <th align="left"><code>remove</code></th>
    <td>
      New admin account created
    </td>
    <td>
      <code>username</code> of removed admin account
    </td>
  </tr>
</table>

## How it works

Here an excerpt of a `couch.ini` that stores a map of two admin accounts with
their hashed passwords. The format is `-{password scheme}-{derived key},{salt},{iterations}`.

```ini
[admins]
admin=-pbkdf2-e079757b4cb58ae17467c8befe725778ce97e422,0aef36ccafa33f3e81ae897baf23f85c,10
anotheradmin=-pbkdf2-67c8befe725778ce97e422e079757b4cb58ae174,7baf23f85c0aef36ccafa33f3e81ae89,10
```

## Testing

Local setup

```
git clone git@github.com:hoodiehq/pouchdb-admins.git
cd pouchdb-admins
npm install
```

Run all tests and code style checks

```
npm test
```

Run all tests on file change

```
npm run test:watch
```

Run tests from single file

```
node tests/integration/constructor-test.js
# PROTIP™: pipe output through https://www.npmjs.com/package/tape#pretty-reporters
```

### License

[Apache-2.0](https://github.com/hoodiehq/hoodie/blob/master/LICENSE)
