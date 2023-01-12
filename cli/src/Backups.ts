import { createLevelSearchData } from "./SearchManager";
import { generalOutDir } from "./LevelConvert";

export const backupDir = 'E:/backup/raw-levels';
export const originalBackupDir = `${backupDir}/original`;

/**
 * Reuploads all levels in the backup directory to the levels index.
 * @param backupId The ID of the backup to restore.
 * @param popularOnly Whether to only restore popular levels.
 */
export async function restoreLevelBackup(backupId: number, popularOnly = false) {
	const dumpDir = `${generalOutDir}/updatedb-dumps/${backupId}/extracted-levels`;

	for (const dir of [`${originalBackupDir}/1`, `${originalBackupDir}/2`, dumpDir]) {
		console.log(`Processing directory ${dir}`);
		const offset = 0; // Use this if the process was interrupted
		await createLevelSearchData({
			inputDataDir: dir,
			offset,
			onlyPopular: popularOnly,
		});
	}
}