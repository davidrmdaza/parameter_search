
# Parameter Search Extension (scaffold)

Small Manifest V3 extension that opens a new tab to display browser history and parse URL parameters in a Parameters column.

Notes:
- Permissions requested: `history`, `tabs`.
- The UI is in `history.html` and the logic in `history.js`.
- Background worker is `background.js` which opens the tab on icon click.

Behavior:
- The table columns are Date, Title, Domain, Parameters.
- `Parameters` will show a small key/value table when the URL contains query parameters; otherwise it is blank.
# parameter_search
Parameter Search is browser extension that helps you search your browser using parameter keys and values
