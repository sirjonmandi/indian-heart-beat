import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'accessToken.db', location: 'default' });

export const fetchUserDataFromDb = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM user;`,
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            resolve(results.rows.item(0));
          } else {
            resolve(null);
          }
        },
        error => {
          reject(error);
        }
      );
    },
    error => {
      console.error("SQL Query Error:", error);
      reject(error);
    });
  });
};

export const createTable = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS stores (
        store_id INTEGER PRIMARY KEY NOT NULL,
        store_data TEXT
      );`,
      [],
      () => {
        console.log('Table created successfully.');
      },
      (error) => {
        console.log('Error creating table:', error);
      }
    );
  });
};

export const insertData = (storeData) => {
  db.transaction((tx) => {
    storeData.forEach((item) => {
      const storeId = item.store.id;
      const storeDataString = JSON.stringify(item);

      tx.executeSql(
        `INSERT OR REPLACE INTO stores (store_id, store_data) VALUES (?, ?);`,
        [storeId, storeDataString],
        () => {
          console.log('Data inserted successfully.');
        },
        (error) => {
          console.log('Error inserting data:', error);
        }
      );
    });
  });
};

export const fetchDataFromSQLite = (setStoreData) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM stores;`,
      [],
      (tx, results) => {
        const rows = results.rows;
        const data = [];
        for (let i = 0; i < rows.length; i++) {
          const row = rows.item(i);
          data.push(JSON.parse(row.store_data));
        }
        setStoreData(data);
        console.log('Data fetched from SQLite:', data);
      },
      (error) => {
        console.log('Error fetching data from SQLite:', error);
      }
    );
  });
};

export const createAllOfflineTable = () => {
  // Create tables
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS store (id INTEGER PRIMARY KEY, store_id INTEGER UNIQUE, store_name TEXT, sync_on TEXT,status INTEGER);`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS ticket (id INTEGER PRIMARY KEY, ticket_id INTEGER UNIQUE,ticket_type_id INTEGER, store_id INTEGER, ticket_data TEXT);`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS comment (id INTEGER PRIMARY KEY, comment_id INTEGER UNIQUE, ticket_id INTEGER, store_id INTEGER, comment_data TEXT);`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS asset (id INTEGER PRIMARY KEY,asset_id INTEGER UNIQUE, store_id INTEGER, asset_type_id INTEGER,assert_category INTEGER,asset_data TEXT);`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS fsr (
        id INTEGER PRIMARY KEY, 
        fsr_id INTEGER NULL, 
        ticket_id INTEGER, 
        fsr_data TEXT, 
        UNIQUE(fsr_id, ticket_id)
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS fsr_offline (id INTEGER PRIMARY KEY, fsr_id INTEGER UNIQUE, ticket_id INTEGER, fsr_form TEXT,is_pending INTEGER);`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS ticket_offline_attachment (id INTEGER PRIMARY KEY, ticket_id INTEGER, ticket_form TEXT,is_pending INTEGER);`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS ticket_offline_data (id INTEGER PRIMARY KEY, ticket_id INTEGER, ticket_formdata TEXT, dataType TEXT,is_pending INTEGER);`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS pm_cm_checklist (
        id INTEGER PRIMARY KEY, 
        ticket_id INTEGER UNIQUE, 
        checklist_data TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS pm_cm_checklist_expanded (
        id INTEGER PRIMARY KEY, 
        ticket_id INTEGER UNIQUE, 
        checklist_data TEXT
      );`
    );
    tx.executeSql(`CREATE TABLE IF NOT EXISTS pm_cm_checklist_data (
      id INTEGER PRIMARY KEY, 
      ticket_id INTEGER, 
      item TEXT, 
      checklist_data TEXT,
      UNIQUE(ticket_id, item)
    );`);

  });
}
export const truncateTables = () => {
  db.transaction((tx) => {
    tx.executeSql('DELETE FROM ticket;', [],
      () => console.log('All rows deleted from the ticket table'),
      (error) => console.error('Error deleting rows from ticket table:', error)
    );

    tx.executeSql('DELETE FROM comment;', [],
      () => console.log('All rows deleted from the comment table'),
      (error) => console.error('Error deleting rows from comment table:', error)
    );

    tx.executeSql('DELETE FROM asset;', [],
      () => console.log('All rows deleted from the asset table'),
      (error) => console.error('Error deleting rows from asset table:', error)
    );

    tx.executeSql('DELETE FROM ticket_offline_data;', [],
      () => console.log('All rows deleted from the ticket_offline_data table'),
      (error) => console.error('Error deleting rows from asset table:', error)
    );
    tx.executeSql('DELETE FROM pm_cm_checklist;', [],
      () => console.log('All rows deleted from the pm_cm_checklist table'),
      (error) => console.error('Error deleting rows from pm_cm_checklist table:', error)
    );
    tx.executeSql('DELETE FROM pm_cm_checklist_expanded;', [],
      () => console.log('All rows deleted from the pm_cm_checklist_expanded table'),
      (error) => console.error('Error deleting rows from pm_cm_checklist_expanded table:', error)
    );
    tx.executeSql('DELETE FROM pm_cm_checklist_data;', [],
      () => console.log('All rows deleted from the pm_cm_checklist_data table'),
      (error) => console.error('Error deleting rows from pm_cm_checklist_data table:', error)
    );
    // Reset AUTOINCREMENT counters (if any)
    tx.executeSql("DELETE FROM sqlite_sequence WHERE name IN ('ticket', 'comment', 'asset','ticket_offline_data','pm_cm_checklist','pm_cm_checklist_expanded,'pm_cm_checklist_data');", [],
      () => console.log('AUTOINCREMENT counters reset'),
      (error) => console.error('Error resetting AUTOINCREMENT counters:', error)
    );

    tx.executeSql('DELETE FROM store;', [],
      () => console.log('All rows deleted from the store table'),
      (error) => console.error('Error deleting rows from store table:', error)
    );

  },
    (error) => {
      console.error('Transaction error: ', error);
    },
    () => {
      console.log('Transaction complete, all tables truncated.');
    });
};

export const deleteTables = () => {
  db.transaction((tx) => {
    tx.executeSql('DROP TABLE ticket;', [],
      () => console.log('ticket table deleted'),
      (error) => console.error('Error deleting rows from ticket table:', error)
    );

    tx.executeSql('DROP TABLE asset;', [],
      () => console.log('asset table deleted'),
      (error) => console.error('Error deleting rows from asset table:', error)
    );

    tx.executeSql('DROP TABLE fsr;', [],
      () => console.log('fsr table deleted'),
      (error) => console.error('Error deleting rows from fsr table:', error)
    );

    tx.executeSql('DROP TABLE fsr_offline;', [],
      () => console.log('fsr_offline table deleted'),
      (error) => console.error('Error deleting rows from fsr_offline table:', error)
    );

    tx.executeSql('DROP TABLE ticket_offline_attachment;', [],
      () => console.log('ticket_offline_attachment table deleted'),
      (error) => console.error('Error deleting rows from ticket_offline_attachment table:', error)
    );

    tx.executeSql('DROP TABLE ticket_offline_data;', [],
      () => console.log('ticket_offline_data table deleted'),
      (error) => console.error('Error deleting rows from ticket_offline_data table:', error)
    );

    tx.executeSql('DROP TABLE comment;', [],
      () => console.log('All rows deleted from the comment table'),
      (error) => console.error('Error deleting rows from comment table:', error)
    );

    // tx.executeSql('DROP TABLE asset;', [],
    //   () => console.log('All rows deleted from the asset table'),
    //   (error) => console.error('Error deleting rows from asset table:', error)
    // );
    tx.executeSql('DROP TABLE store;', [], 
      () => console.log('All rows deleted from the asset table'), 
      (error) => console.error('Error deleting rows from asset table:', error)
    );
    // tx.executeSql('DROP TABLE ticket_offline_attachment;', [],
    //   () => console.log('All rows deleted from the ticket_offline_attachment table'),
    //   (error) => console.error('Error deleting rows from ticket_offline_attachment table:', error)
    // );
    // tx.executeSql('DROP TABLE ticket_offline_data;', [],
    //   () => console.log('All rows deleted from the ticket_offline_data table'),
    //   (error) => console.error('Error deleting rows from ticket_offline_data table:', error)
    // );
    tx.executeSql('DROP TABLE pm_cm_checklist;', [],
      () => console.log('pm_cm_checklist table deleted'),
      (error) => console.error('Error deleting rows from pm_cm_checklist table:', error)
    );
    tx.executeSql('DROP TABLE pm_cm_checklist_expanded;', [],
      () => console.log('pm_cm_checklist_expanded table deleted'),
      (error) => console.error('Error deleting rows from pm_cm_checklist_expanded table:', error)
    );
    tx.executeSql('DROP TABLE pm_cm_checklist_data;', [],
      () => console.log('pm_cm_checklist_data table deleted'),
      (error) => console.error('Error deleting rows from pm_cm_checklist_data table:', error)
    );


  },
    (error) => {
      console.error('Transaction error: ', error);
    },
    () => {
      console.log('Transaction complete, all tables truncated.');
    });
};

export const fetchDataFromDb = (table) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM ${table};`,
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            const rows = [];
            for (let i = 0; i < results.rows.length; i++) {
              rows.push(results.rows.item(i));
            }
            console.log('Rows:', rows);
            resolve(rows);
          } else {
            resolve(null);
          }
        },
        error => {
          reject(error);
        }
      );
    });
  });
};

export const fetchTicketByIdFromSQLite = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM ticket WHERE ticket_id = ?;`, // Query to fetch by id
        [id], // Use the id as a parameter
        (tx, results) => {
          console.log('Results:', results); // Log the results object
          const rows = results.rows;

          console.log('Rows:', rows); // Log the rows to see if they contain data

          if (rows.length > 0) {
            const row = rows.item(0);
            console.log("Row Data:", row); // Log the row to see if it's being fetched
            const parsedTicketData = JSON.parse(row.ticket_data);
            resolve(parsedTicketData);
          } else {
            console.log('No ticket found with id:', id); // Log if no rows are found
            resolve(null);
          }
        },
        error => {
          console.log('Error executing SQL:', error); // Log any SQL execution errors
          reject(error);
        }
      );
    });
  });
};

// fetch all tickets then fetch all ticket datas by that id
export const fetchTicketDataFromSQLite = (table) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM ${table};`, // Modified query to fetch all tickets
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            const rows = [];
            for (let i = 0; i < results.rows.length; i++) {
              rows.push(results.rows.item(i));
            }
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              const parsedTicketData = JSON.parse(row.ticket_data);
              rows[i].ticket_data = parsedTicketData;
            }
            console.log('Rows:', rows);
            resolve(rows);
          } else {
            console.log('No tickets found'); // Log if no rows are found
            resolve(null);
          }
        },
        error => {
          reject(error);
        }
      );
    });
  });
};

// fetch pm_cm_checklist by ticket id
export const fetchCheckListByIdFromSQLite = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM pm_cm_checklist WHERE ticket_id = ?;`, // Query to fetch by id
        [id], // Use the id as a parameter
        (tx, results) => {
          console.log('Results:', results); // Log the results object
          const rows = results.rows;

          console.log('Rows:', rows); // Log the rows to see if they contain data

          if (rows.length > 0) {
            const row = rows.item(0);
            console.log("Row Data:", row); // Log the row to see if it's being fetched
            const parsedTicketData = JSON.parse(row.checklist_data);
            resolve(parsedTicketData);
          } else {
            console.log('No ticket found with id:', id); // Log if no rows are found
            resolve(null);
          }
        },
        error => {
          console.log('Error executing SQL:', error); // Log any SQL execution errors
          reject(error);
        }
      );
    });
  });
};

export const fetchCheckListDataFromSQLiteByItemAndTicketId = (ticket_id, item) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT checklist_data FROM pm_cm_checklist_data WHERE ticket_id = ? AND item = ?;`, // Query to fetch by id
        [ticket_id, item], // Use the id as a parameter
        (tx, results) => {
          if (results.rows.length > 0) {
            const data = results.rows.item(0).checklist_data;
            try {
              const parsedData = JSON.parse(data);
              console.log('121212121212121212121212121212121212:', parsedData);
              resolve(parsedData);
            } catch (error) {
              console.error('Error parsing checklist data:', error);
              reject(error);
            }
          } else {
            resolve(null);
          }
        },
        error => {
          console.log('Error executing SQL:', error); // Log any SQL execution errors
          reject(error);
        }
      );
    });
  });
};


// fetch pm_cm_checklist_expanded by ticket id
export const fetchCheckListExpandedByIdFromSQLite = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM pm_cm_checklist_expanded WHERE ticket_id = ?;`, // Query to fetch by id
        [id], // Use the id as a parameter
        (tx, results) => {
          console.log('Results:', results); // Log the results object
          const rows = results.rows;

          console.log('Rows:', rows); // Log the rows to see if they contain data

          if (rows.length > 0) {
            const row = rows.item(0);
            console.log("Row Data:", row); // Log the row to see if it's being fetched
            const parsedTicketData = JSON.parse(row.checklist_data);
            resolve(parsedTicketData);
          } else {
            console.log('No ticket found with id:', id); // Log if no rows are found
            resolve(null);
          }
        },
        error => {
          console.log('Error executing SQL:', error); // Log any SQL execution errors
          reject(error);
        }
      );
    });
  });
};


// fetch fsr by id
export const fetchFSRByIdFromSQLite = (ticket_id, fsr_id) => {
  return new Promise((resolve, reject) => {
    console.log('Fetching FSR with ticket_id:', ticket_id, 'and fsr_id:', fsr_id); // Log the ticket_id and fsr_id
    db.transaction(tx => {
      let query;
      let params;

      if (fsr_id === null) {
        query = `SELECT * FROM fsr WHERE ticket_id = ? AND fsr_id IS NULL;`;
        params = [ticket_id];
      } else {
        query = `SELECT * FROM fsr WHERE ticket_id = ? AND fsr_id = ?;`;
        params = [ticket_id, fsr_id];
      }

      tx.executeSql(
        query, // Query to fetch by id
        params, // Use the id as a parameter
        (tx, results) => {
          console.log('Results:', results); // Log the results object
          console.log('Results rows:', results.rows); // Log the rows object
          console.log('Results rows length:', results.rows.length); // Log the length of rows

          if (results.rows.length > 0) {
            const row = results.rows.item(0);
            console.log("Row Data:", row); // Log the row to see if it's being fetched
            const parsedTicketData = JSON.parse(row.fsr_data);
            resolve(parsedTicketData);
          } else {
            console.log('No FSR found with ticket_id:', ticket_id, 'and fsr_id:', fsr_id); // Log if no rows are found
            resolve(null);
          }
        },
        error => {
          console.log('Error executing SQL:', error); // Log any SQL execution errors
          reject(error);
        }
      );
    });
  });
};

// store sync  offline data
export const syncStoreData = (store_id, store_name, date, status) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO store (store_id, store_name, sync_on,status) 
         VALUES (?, ?, ?,?) 
         ON CONFLICT(store_id) DO UPDATE SET sync_on = excluded.sync_on`,
        [store_id, store_name, date, status]
      );
    }, (error) => {
      reject(error)
      console.error('Transaction error:', error); // Handle transaction errors (optional)
    }, () => {
      resolve(true)
      console.log('Transaction successful'); // Log successful transaction (optional)
    });
  });
};

// store fsr for offline data
export const storeFSRFormData = (id, ticket_id, formData) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO fsr_offline (fsr_id, ticket_id, fsr_form,is_pending) 
         VALUES (?, ?, ?,?) 
         ON CONFLICT(fsr_id) DO UPDATE SET fsr_form = excluded.fsr_form`,
        [id, ticket_id, formData, 1]
      );
    }, (error) => {
      reject(error)
      console.error('Transaction error:', error); // Handle transaction errors (optional)
    }, () => {
      resolve(true)
      console.log('Transaction successful'); // Log successful transaction (optional)
    });
  });
};

export const storeCheckListData = (ticket_id, item, checklist_data) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO pm_cm_checklist_data (ticket_id, item, checklist_data)
          VALUES (?, ?, ?)
          ON CONFLICT(ticket_id, item) DO UPDATE SET checklist_data = excluded.checklist_data`,
        [ticket_id, item, checklist_data],
        (tx, results) => {
          resolve(true);
          console.log('Transaction successful'); // Log successful transaction (optional)
        },
        (error) => {
          reject(error);
          console.error('Transaction error:', error); // Handle transaction errors (optional)
        }
      );
    });
  });
};

// Get Count of unsync data
export const fetchCountFromDb = (table) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT COUNT(*) as count FROM ${table};`, // Modified query to count entries
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            resolve(results.rows.item(0).count); // Return the count value
          } else {
            resolve(0); // Return 0 if no rows are found
          }
        },
        error => {
          reject(error);
        }
      );
    });
  });
};

export const deleteRecodeById = (id, table, column) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM ${table} WHERE ${column} = ?;`, // SQL query to delete entry by id
        [id], // Pass id as a parameter
        (tx, results) => {
          if (results.rowsAffected > 0) { // Check if any rows were affected (deleted)
            resolve(true); // Resolve the promise if deletion was successful
          } else {
            resolve(false); // Resolve as false if no rows were deleted
          }
        },
        error => {
          reject(error); // Reject the promise if an error occurs
        }
      );
    });
  });
};

// store ticket fault info,comment for offline data
export const storeTicketFormData = (ticket_id, formData, type) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO ticket_offline_data (ticket_id, ticket_formdata,dataType,is_pending) 
         VALUES (?, ?, ?,?) `,
        [ticket_id, formData, type, 1]
      );
    }, (error) => {
      reject(error)
      console.error('Transaction error:', error); // Handle transaction errors (optional)
    }, () => {
      resolve(true)
      console.log('Transaction successful'); // Log successful transaction (optional)
    });
  });
};

// store ticket attachment offline data
export const storeTicketAttachmentData = (ticket_id, formData) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO ticket_offline_attachment (ticket_id, ticket_form,is_pending) 
         VALUES (?, ?, ?) `,
        [ticket_id, formData, 1]
      );
    }, (error) => {
      reject(error)
      console.error('Transaction error:', error); // Handle transaction errors (optional)
    }, () => {
      resolve(true)
      console.log('Transaction successful'); // Log successful transaction (optional)
    });
  });
};

// fetch assert by category id
export const fetchDistinctAssetTypeFromSQLite = (asset_category, store_id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM asset WHERE store_id = ? AND assert_category = ? GROUP BY asset_type_id;`, // Modified query with DISTINCT
        [store_id, asset_category], // Parameters for store_id and asset_category
        (tx, results) => {
          console.log('Results:', results); // Log the results object
          const rows = [];

          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            // console.log("Row:",row)
            // rows.push(row.asset_data); // Push the distinct asset_type_id values into the array
            const parsedAssetData = JSON.parse(row.asset_data);
            rows.push(parsedAssetData);
          }

          if (rows.length > 0) {
            resolve(rows); // Resolve with the array of distinct asset_type_id
          } else {
            console.log('No assets found matching the criteria'); // Log if no rows are found
            resolve([]); // Resolve with an empty array if no matches
          }
        },
        error => {
          console.log('Error executing SQL:', error); // Log any SQL execution errors
          reject(error);
        }
      );
    });
  });
};


// fetch assert by category id
export const fetchAssetSQLite = (asset_type_id, store_id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM asset WHERE store_id = ? AND asset_type_id = ? ;`, // Modified query with DISTINCT
        [store_id, asset_type_id], // Parameters for store_id and asset_category
        (tx, results) => {
          console.log('Results:', results); // Log the results object
          const rows = [];

          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            // console.log("Row:",row)
            // rows.push(row.asset_data); // Push the distinct asset_type_id values into the array
            const parsedAssetData = JSON.parse(row.asset_data);
            rows.push(parsedAssetData);
          }

          if (rows.length > 0) {
            resolve(rows); // Resolve with the array of distinct asset_type_id
          } else {
            console.log('No assets found matching the criteria'); // Log if no rows are found
            resolve([]); // Resolve with an empty array if no matches
          }
        },
        error => {
          console.log('Error executing SQL:', error); // Log any SQL execution errors
          reject(error);
        }
      );
    });
  });
};

// fetch assert by category id
export const fetchCommentByTicketSQLite = (ticket_id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM comment WHERE ticket_id = ? ;`,
        [ticket_id], // Parameters for ticket_id
        (tx, results) => {
          console.log('Results:', results); // Log the results object
          const rows = [];

          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            const parsedCommenttData = JSON.parse(row.comment_data);
            rows.push(parsedCommenttData);
          }

          if (rows.length > 0) {
            resolve(rows); // Resolve with the array 
          } else {
            console.log('No comment found matching the criteria'); // Log if no rows are found
            resolve([]); // Resolve with an empty array if no matches
          }
        },
        error => {
          console.log('Error executing SQL:', error); // Log any SQL execution errors
          reject(error);
        }
      );
    });
  });
};

export const fetchTicketData = (types) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Generate the correct number of placeholders based on `types` array length
      const placeholders = types.map(() => '?').join(', ');
      tx.executeSql(
        `SELECT * FROM ticket WHERE ticket_type_id IN (${placeholders});`,
        types, // Pass `types` array directly
        (tx, results) => {
          if (results.rows.length > 0) {
            const rows = [];
            for (let i = 0; i < results.rows.length; i++) {
              rows.push(results.rows.item(i));
            }
            resolve(rows);
          } else {
            resolve(null);
          }
        },
        error => {
          reject(error);
        }
      );
    });
  });
};