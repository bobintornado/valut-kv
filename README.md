# Vault-KV

A time-based version controlled key-value store backed by PostgreSQL.

## Demo

URL: https://ancient-falls-87896.herokuapp.com/

```
curl -X POST -H "Content-Type: application/json"  https://ancient-falls-87896.herokuapp.com/object --data '{"mykey": "value3"}'
curl https://ancient-falls-87896.herokuapp.com/object/mykey
curl https://ancient-falls-87896.herokuapp.com/object/mykey\?timestamp\=1497200200
```

### Sample Response
```
{
  "key": "mykey",
  "value": "value4",
  "timestamp": 1497434025
}
```

## Requirements

1. Given a key, get the lastest value of the key
2. Given a key with a timestamp, get the "lastest" value of the key of that timestamp

## Solution

### Approach

Store all values with timestamp in a SQL database, use timestamp as query filter when necessary

### Schema Design

**Table: keys**

| Column  | Type | Remark |
| ------------- | ------------- | ------------- |
| id  | serial  | id of the key |
| key  | text  | key value |
| value | text | lastest value of the key |


**Table: history_values**

| Column  | Type | Remark |
| ------------- | ------------- | ------------- |
| key_id  | int  | id of the key in keys table |
| value  | text  | value of the key |
| timestamp | timestamp | timestamp when the value is updated |

### Optimization Consideration

1. To prevent saving same key values more than once and wasting storage, store key with lastest value once only in one table, use another table to store all historical values. When timestamp is specified, look up another table with id of keys table as foreign key. 
2. Add index on both `keys.key` and `history_values.timestamp` to speed up querying.

## Setup

### App

Install and config node to v6.11.0.

Use `touch .env` to create .env file.

Put something like following setup into the .env file

```
DATABASE_URL=postgres://bob:@localhost:5432/vault_kv
TEST_DATABASE_URL=postgres://bob:@localhost:5432/vault_kv_test
PORT=3000
```

### Database

```
createdb vault_kv
psql -U username -d vault_kv -a -f ./database/init.sql
createdb vault_kv_test
psql -U username -d vault_kv_test -a -f ./database/init.sql
```

### Run Test

`./node_modules/.bin/mocha test/`

## Further Thoughts

There is quite some relationships here, so using PostgreSQL should be a natrual fit. However, the actual implementation is more complext than I initially thought, and feel slightly off the designed usage of RDBMS (I have to use a few fancy features).

The current implementation should hold a reasonable amount of load without breaking, but it will be interesting to explore more options.

