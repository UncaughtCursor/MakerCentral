import { createLevelSearchData } from "./SearchManager";
import { generalOutDir } from "./LevelConvert";

export const backupDir = 'E:/backup/raw-levels';
export const originalBackupDir = `${backupDir}/original`;

/**
 * Reuploads all levels in the backup directory to the levels index.
 */
export async function restoreLevelBackup(backupId: number) {
	const dumpDir = `${generalOutDir}/updatedb-dumps/${backupId}/extracted-levels`;

	for (const dir of [`${originalBackupDir}/1`, `${originalBackupDir}/2`, dumpDir]) {
		console.log(`Processing directory ${dir}`);
		const offset = 0; // Use this if the process was interrupted
		await createLevelSearchData({
			inputDataDir: dir,
			batchSize: 100000,
			offset,
		});
	}
}