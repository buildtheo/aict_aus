---
description: >-
  A few steps to help set up the lab with the proper content and to review some
  popup dialogs.
---

# Lab 0 - Setup

Duration: 5 minutes



1. If you have already logged in to your instance, skip to step 2.  If you have not already logged into your instance, get the details from your instructor.
2.  When you log in for the first time (and when you impersonate other users for the first time), you will see a popup dialog box to show how you can work your way.  Click the **Next** button several times until it goes away.  The button name will change to **Got it!**. Go ahead and click **Got it!** to close out the dialog.<br>

    <figure><img src=".gitbook/assets/image (157).png" alt=""><figcaption></figcaption></figure>

    Once you go through those screens, you will be at the _Shared admin dashboard_ workspace.
3.  Click the **Workspaces** menu drop down at the top of the screen and then select the workspace **AI Risk and Compliance Workspace**.<br>

    <figure><img src=".gitbook/assets/image (158).png" alt=""><figcaption></figcaption></figure>


4.  During the import of the Authority Documents and related requirements, some of the source content was duplicated causing issues with the compliance charts.  To resolve this, click on the **List** icon in the far-left part of the screen.  In the **Library** section, click on **Authority documents** (may show abbreviated, depending on your screen and zoom level).<br>

    <figure><img src=".gitbook/assets/image (81).png" alt=""><figcaption></figcaption></figure>


5.  You should now see four Authority document records (if the page does not refresh, in the Library section, click on **Citations** and then click again on **Authority documents**). Next, select the check boxes next to **EU AI Act** and **NIST AI RMF**. Once those two records are selected, click the **Delete (2)** button.<br>

    <figure><img src=".gitbook/assets/image (82).png" alt=""><figcaption></figcaption></figure>


6.  The _Delete_ popup dialog should now be displayed, showing that you will be deleting the two Authority documents and related records.  Click the red **Delete All** button.<br>

    <figure><img src=".gitbook/assets/image (83).png" alt=""><figcaption></figcaption></figure>


7.  Next, run the lab fix script. It prepares the instance so the dashboards, Access map, Value tab and Lab 4 remediation tasks work for the lab personas. First, elevate your role: click your **profile avatar** in the top-right corner, then click **Elevate role**. In the _Elevate role_ dialog, check **security\_admin** and click **Update**.<br>

    <figure><img src=".gitbook/assets/image (214).png" alt="Elevate role dialog with security_admin checked"><figcaption></figcaption></figure>


8.  Open the [lab fix script](https://github.com/buildtheo/aict_aus/blob/main/scripts/AICT_LAB_FIX.js), click the **Copy raw file** button, and keep it on your clipboard.
9.  Click **All**, type **Scripts - Background** in the filter, and open it. Paste the script into the _Run script_ box, make sure **in scope** is set to **global**, and click **Run script** **once**. Wait a few seconds for the output; do not click it again.
10. Check the last line of the output:
    * **RESULT: FIXED** or **RESULT: NOTHING TO FIX** - you are ready to continue.
    * **RESULT: NOT RUN** or **RESULT: STOPPED** - do not continue. Share the output with your instructor.
11. You have completed the setup and the compliance charts will now show correctly.
