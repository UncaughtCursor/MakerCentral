# How to Restore the MakerCentral Database

1. Immediately delete the updateDB cloud function on Firebase; wait for current execution to finish.

2. Plug in the SMM2 Archive external hard drive.

3. Open the MakerCentral CLI. Run the `download-updatedb-dumps` command. This will download cloud backup data downloaded from the updateDB cloud function's execution.

4. Run the `extract-dump-levels` command. This will extract the level data from the downloaded dumps and prepare it for import.

5. Delete all indices in the Meilisearch instance to ensure that the new data is indexed properly and space is not wasted. Then run the `create-indices` command. This will create the indices that the data will be imported into.

6. Run the `set-search-settings` command. This will set the Meilisearch instance's settings to the correct values.

7. Set the value of `latestBackupId` in the CLI's `index.ts` file to the ID of the latest backup. Assuming the backup drive is `E:/`, the ID is the name of the newest folder in `E:/processed/updatedb-dumps/`.

8. Run the `restore-popular-level-backup` command. This will restore the popular level backup to the Meilisearch instance. We do this first to restore partial service as soon as possible.

9. In `pages/_app.tsx` in this project, set the value of `isInBackupMode` to `true`. This switches the search to use the popular level index instead of the main index. You'll also want to add a warning banner to `pages/levels/search/[q].tsx`, something like:

```JSX
<WarningBanner
	message={(
		<div>
			MakerCentral's database is currently having issues. Work is being done to restore all of the levels. For more info and updates, check the {discordLinkElement}.
		</div>
	)}
	style={{
		marginBottom: '-12px',
	}}
/>
```

10. Commit and push the changes, then merge with the `prod` branch. This will deploy the changes to the production site.

11. Go to DigitalOcean and upgrade the Meilisearch instance to maximum RAM and CPU. This will speed up the import process by a lot. It will cost more, but it's worth it.

12. Run the `restore-level-backup` command. This will restore the main level backup to the Meilisearch instance. This will take a while.

13. Do the same with the `restore-user-backup` and `restore-world-backup` commands. These will restore the user and world backups to the Meilisearch instance.

14. Verify that everything is working properly. If it is, you can delete the warning banner and set `isInBackupMode` back to `false` in `pages/_app.tsx` and downgrade the Meilisearch instance back to normal. If it isn't, I just want to say that I'm sorry and I hope you're doing okay.

15. Breathe a sigh of relief.