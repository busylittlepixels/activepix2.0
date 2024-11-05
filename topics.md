topics:

Viewing a gallery 
Creating an event
Deleting an event
Getting markers
Changing gallery settings (Event title, logo, location etc.)
Uploading Media
Manually matching participant codes to images
Uploading participant data
Participant gallery selector embed usage

Viewing a gallery
    Participants:
        - Go to wherever the gallery selector embed is located (Usually the race's website, or the Activepix main site.)
        - Enter the participant code that was given to you by the event organizer.
        - Click the "View Gallery" button.
    Event Managers:
        - ''
    Activepix Staff:
        - ''

Creating an event
    Participants:
        - N/A
    Event Managers:
        - Request an event creation from Activepix staff.
    Activepix Staff:
        - Ask Harry, OR:
        - Make sure branch is up to date, then create a new stack entry in /APAWS/bin/apaws.ts
        - Deploy the stack, and wait for the new stack to be created (5-10 minutes).

Deleting an event
    Participants:
        - N/A
    Event Managers:
        - Request an event deletion from Activepix staff.
    Activepix Staff:
        - Ask Harry, OR:
        - Perform any archival necessary, then delete the event's cloudformation stack, making sure corresponding S3 buckets & DynamoDB tables are deleted.

Getting markers
    Participants:
        - N/A
    Event Managers:
        - Go to admin.<eventdomain>.races.activepix.com
        - Click 'Download markers' in the sidebar.
        - Click the download button, you'll get a zip file with the markers.
    Activepix Staff:
        - ''

Changing gallery settings (Event title, logo, location etc.)
    Participants:
        - N/A
    Event Managers:
        - Go to admin.<eventdomain>.races.activepix.com
        - Click 'Configuration' in the sidebar.
        - Change the settings as needed.
        - Click 'Save'.
    Activepix Staff:
        - ''

Uploading Media
    Participants:
        - N/A
    Event Managers:
        - Prepare your media folders as follows:
        - - Images should all be in a single folder. Subfolders are allowed,but no images should have the same name AND path.
        - - Ideal max image size is 2500x2500px.
        - - Ideal image format is PNG.
        - Go to admin.<eventdomain>.races.activepix.com
        - Click 'Upload Media' in the sidebar.
        - Click 'Choose Directory' and select the folder containing your images.
        - Click 'Upload'.
        - Wait for the process to complete (Closing the tab will stop the upload).
    Activepix Staff:
        - ''
        - Can also use S3 cli sync to upload media, which may be faster.

Manually matching participant codes to images
    Participants:
        - N/A
    Event Managers:
        - Go to admin.<eventdomain>.races.activepix.com
        - Click 'Media Library' in the sidebar.
        - Click an image to set the participant codes for.
        - You can now either remove existing codes, or add new ones.
        - Updates are saved automatically.#
    Activepix Staff:
        - ''

Uploading participant data
    Participants:
        - N/A
    Event Managers:
        - Prepare your participant data as follows:
        - - A CSV files with the following columns, at a minimum (Custom themes may use additional columns):
        - - firstName: The participant's first name.
        - - lastName: The participant's last name.
        - - participantCode: The participant's code.
        - - distance: The participant's distance.
        - - time: The participant's time.
        - Go to admin.<eventdomain>.races.activepix.com
        - Click 'Upload Participant Data' in the sidebar.
        - Click 'Choose File' and select your CSV file.
        - Click 'Upload'.
        - Wait for the process to complete (Closing the tab will stop the upload).
    Activepix Staff:
        - ''
        - Activepix staff can also edit participant data through cms.<eventdomain>.races.activepix.com

Participant gallery selector embed usage
    Participants:
        - See 'Viewing a gallery'.
    Event Managers:
        - GETTING THE EMBED CODE:
        - - Go to admin.<eventdomain>.races.activepix.com


