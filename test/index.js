const fs = require('node:fs')
const { pipeline } = require('node:stream/promises')
const { Pool } = require('pg')
const { from: copyFrom } = require('pg-copy-streams')

var pool = new Pool({
    host: 'aws-1-us-west-2.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.facxvlrqprisdfnpnrvh',
    password: 'Licona2026*',
    ssl: false
})


async function importCsv() {
  const client = await pool.connect()

  try {
    const copyStream = client.query(
      copyFrom(`
        COPY csv_staging FROM STDIN
        WITH (
            FORMAT CSV,
            HEADER true,
            DELIMITER ';'
        )
      `)
    )

    await pipeline(
      fs.createReadStream('./RegistroPendientes.csv'),
      copyStream
    )

    console.log('CSV cargado correctamente')

    const result = await client.query(
      'SELECT COUNT(*) FROM csv_staging'
    )

    console.log(`Total registros: ${result.rows[0].count}`)

  } catch (error) {
    console.error('Error importando CSV:')
    console.error(error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

importCsv()