const db = require('../db');

const newImageUrl = 'https://i.ytimg.com/vi/SJjA-nxHOhk/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCTvKlg4mDFvgQ3W0lgmHJh17v2Hw';

(async () => {
  try {
    console.log('Updating pandal ID=11 with new image URL...');
    
    const result = await db.query(
      'UPDATE pandals SET image_url = $1 WHERE id = $2 RETURNING id, name, image_url',
      [newImageUrl, 11]
    );
    
    if (result.rows.length > 0) {
      console.log('\n✓ Successfully updated:');
      console.log(`  ID: ${result.rows[0].id}`);
      console.log(`  Name: ${result.rows[0].name}`);
      console.log(`  Image URL: ${result.rows[0].image_url}`);
    } else {
      console.log('No rows updated. Pandal ID=2 not found.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating pandal:', error);
    process.exit(1);
  }
})();
