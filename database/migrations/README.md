# Legacy SQL migrations (historical reference only)
#
# These files are NOT applied automatically by the Postgres Docker image.
# Official postgres entrypoint only runs scripts in the top level of
# /docker-entrypoint-initdb.d/ — not nested directories like migrations/.
#
# Live FastAPI schema is owned by Alembic under backend/alembic/.
# Do not dual-write divergent DDL here.
