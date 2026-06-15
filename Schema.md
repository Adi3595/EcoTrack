# DATABASE SCHEMA

# USERS

| Field         | Type      |
| ------------- | --------- |
| id            | UUID      |
| name          | VARCHAR   |
| email         | VARCHAR   |
| password_hash | TEXT      |
| eco_score     | INTEGER   |
| created_at    | TIMESTAMP |

# ACTIVITIES

| Field          | Type      |
| -------------- | --------- |
| id             | UUID      |
| user_id        | UUID      |
| category       | VARCHAR   |
| activity_value | FLOAT     |
| emission_value | FLOAT     |
| created_at     | TIMESTAMP |

# RECOMMENDATIONS

| Field          | Type  |
| -------------- | ----- |
| id             | UUID  |
| user_id        | UUID  |
| recommendation | TEXT  |
| impact_score   | FLOAT |

# CHALLENGES

| Field         | Type    |
| ------------- | ------- |
| id            | UUID    |
| title         | VARCHAR |
| description   | TEXT    |
| reward_points | INTEGER |

# USER_CHALLENGES

| Field        | Type    |
| ------------ | ------- |
| user_id      | UUID    |
| challenge_id | UUID    |
| completed    | BOOLEAN |

# REPORTS

| Field        | Type      |
| ------------ | --------- |
| id           | UUID      |
| user_id      | UUID      |
| report_type  | VARCHAR   |
| generated_at | TIMESTAMP |
