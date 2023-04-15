# How to Restore the MakerCentral Database

1. Immediately delete the updateDB cloud function on Firebase; wait for current execution to finish.

2. Plug in the SMM2 Archive external hard drive.

3. Delete all indices in the Meilisearch instance to ensure that the new data is indexed properly and space is not wasted. Then run the `create-indices` command. This will create the indices that the data will be imported into.

4. Run the `set-search-settings` command. This will set the Meilisearch instance's settings to the correct values.

5. Open the MakerCentral CLI. Run the `restore-popular-level-backup` command. This will restore the popular level backup from last backup to the Meilisearch instance. We do this first to restore partial service as soon as possible.

6. In `pages/_app.tsx` in this project, set the value of `isInBackupMode` to `true`. This switches the search to use the popular level index instead of the main index. You'll also want to add a warning banner to `pages/levels/search/[q].tsx`, something like:

```JSX
<WarningBanner
	message={(
		<div>
			MakerCentral's database is currently having issues. Work is being done to restore all of the levels. We should be back in a few hours. For more info and updates, check the {discordLinkElement}.
		</div>
	)}
	style={{
		marginBottom: '-12px',
	}}
/>
```

7. In `functions/src/constants.ts`, set the value of `isInBackupMode` to `true`. This will allow levels to be loaded from the popular level index instead of the main index. Then deploy the getLevel cloud function using `firebase deploy --only functions:getLevel`.

8. Commit and push the changes, then merge with the `prod` branch. This will deploy the changes to the production site.

9. Run the `download-updatedb-dumps` command. This will download cloud backup data downloaded from the updateDB cloud function's execution. This is one of the longest steps, but it can be optimized to be far less time-consuming by modifying the script to only download the files that you don't already have. Consider doing that, because that will be a lot faster, even counting the time to write the script.

10. Set the value of `latestBackupId` in the CLI's `index.ts` file to the ID of the latest backup. Assuming the backup drive is `E:/`, the ID is the name of the newest folder in `E:/processed/updatedb-dumps/`.

11. Run the `extract-dump-levels` command. This will extract the level data from the downloaded dumps and prepare it for import.

12. Go to DigitalOcean and upgrade the Meilisearch instance to maximum RAM and CPU. This will speed up the import process by an insane amount. It will cost a few extra bucks, but it's worth it.

13. Run the `restore-level-backup` command. This will restore the main level backup to the Meilisearch instance. This will take a while.

14. Do the same with the `restore-user-backup` and `restore-world-backup` commands. These will restore the user and world backups to the Meilisearch instance.

15. Verify that everything is working properly. If it is, you can proceed. If it isn't, I just want to say that I'm sorry and I hope you're doing okay.

16. Delete the warning banner and set `isInBackupMode` back to `false` in `pages/_app.tsx`. Commit and push the changes, then merge with the `prod` branch. This will deploy the changes to the production site.

17. Set `isInBackupMode` back to `false` in `functions/src/constants.ts`. Then deploy the getLevel cloud function using `firebase deploy --only functions:getLevel`.

18. Downgrade the Meilisearch instance back to normal. THIS IS IMPORTANT. THE HIGHEST TIER COSTS OVER $1,000 PER MONTH. DO NOT FORGET TO DO THIS.

19. Breathe a sigh of relief.

20. Remember what got you into this mess and never do it again. Then reward yourself by scrolling through cat pictures on the Internet.