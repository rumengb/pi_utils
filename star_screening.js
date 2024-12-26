// Star Screening
// Description: Re-screen stars from starless and stars image using PixelMath.
//
// Author: Rumen Bogdanovski
// Date: 2024-12-26

#feature-id    Image Processing > Star Screening
#feature-info  "Re-screen stars from starless and stars image using PixelMath."
#feature-icon  :process-interface-icon

#include <pjsr/Sizer.jsh>
#include <pjsr/FrameStyle.jsh>
#include <pjsr/TextAlign.jsh>
#include <pjsr/StdDialogCode.jsh>

#define VERSION "0.1"

function StarScreeningDialog() {
    this.__base__ = Dialog;
    this.__base__();

    this.windowTitle = "Star Screening";

    this.descriptionLabel = new Label(this);
    this.descriptionLabel.text = 
        "This script will re-screen or add the stars to a starless image\n" +
        "using PixelMath.\n" +
        "\n" +
        "If the checkbox 'Re-screen unscreened stars' is checked:\n\n" +
        "rescreened_stars = ~((~starless)*(~stars))\n\n" +
        "otherwise:\n\n" +
        "rescreened_stars = starless + stars\n" +
        "\n" +
        "\nVersion: " + VERSION + "\n" +
        "Copyright ©2024 by Rumen G.Bogdnovski\n" +
        "e-mail: rumenastro@gmail.com";
    this.descriptionLabel.textAlignment = TextAlign_VertCenter;

    this.descriptionFrame = new Frame(this);
    this.descriptionFrame.frameStyle = FrameStyle_Box;
    this.descriptionFrame.sizer = new VerticalSizer;
    this.descriptionFrame.sizer.margin = 6;
    this.descriptionFrame.sizer.add(this.descriptionLabel);

    this.selectStarlessViewLabel = new Label(this);
    this.selectStarlessViewLabel.text = "Select Starless View:";
    this.selectStarlessViewLabel.textAlignment = TextAlign_Left | TextAlign_VertCenter;

    this.starlessViewList = new ViewList(this);
    this.starlessViewList.getAll();

    this.selectStarsViewLabel = new Label(this);
    this.selectStarsViewLabel.text = "Select Stars View:";
    this.selectStarsViewLabel.textAlignment = TextAlign_Left | TextAlign_VertCenter;

    this.starsViewList = new ViewList(this);
    this.starsViewList.getAll();

    this.reScreenCheckbox = new CheckBox(this);
    this.reScreenCheckbox.text = "Re-screen unscreened stars";
    this.reScreenCheckbox.toolTip = 
        "Check this option if the stars are unscreened.\n" +
        "Uncheck if the stars are arithmetically subtracted.\n";
    this.reScreenCheckbox.checked = true;

    this.executeButton = new PushButton(this);
    this.executeButton.text = "Execute";
    this.executeButton.onClick = function() {
        if (this.dialog.starlessViewList.currentView.id == "" || this.dialog.starsViewList.currentView.id == "") {
			console.criticalln("Please select both starless and stars views.");
            return;
        }

        var starlessView = this.dialog.starlessViewList.currentView;
        var starsView = this.dialog.starsViewList.currentView;

		var newId = starlessView.id + "_rescreened";

        var P = new PixelMath;
        if (this.dialog.reScreenCheckbox.checked) {
            P.expression = "~((~" + starlessView.id + ")*(~" + starsView.id + "))";
			console.writeln("Re-screening stars:\n\n\  " + newId + " = " + P.expression);
        } else {
            P.expression = starlessView.id + " + " + starsView.id;
			console.writeln("Adding stars:\n\n  " + newId + " = " + P.expression);
        }
        P.expression1 = "";
        P.expression2 = "";
        P.expression3 = "";
        P.useSingleExpression = true;
        P.symbols = "";
        P.generateOutput = true;
        P.singleThreaded = false;
        P.use64BitWorkingImage = false;
        P.rescale = false;
        P.rescaleLower = 0.0;
        P.rescaleUpper = 1.0;
        P.truncate = true;
        P.truncateLower = 0.0;
        P.truncateUpper = 1.0;
        P.createNewImage = true;
        P.showNewImage = true;
        P.newImageId = newId;
        P.newImageWidth = 0;
        P.newImageHeight = 0;
        P.newImageAlpha = false;
        P.newImageColorSpace = PixelMath.prototype.SameAsTarget;
        P.newImageSampleFormat = PixelMath.prototype.SameAsTarget;
        P.executeOn(starlessView);

        this.dialog.ok();
    };

	this.cancelButton = new PushButton(this);
	this.cancelButton.text = "Cancel";
	this.cancelButton.onClick = function() {
		this.dialog.cancel();
	};

    this.sizer = new VerticalSizer;
    this.sizer.margin = 6;
    this.sizer.spacing = 6;
    this.sizer.add(this.descriptionFrame);

    this.sizer.addSpacing(6);
    this.sizer.add(this.selectStarlessViewLabel);
    this.sizer.add(this.starlessViewList);

    this.sizer.addSpacing(6);
    this.sizer.add(this.selectStarsViewLabel);
    this.sizer.add(this.starsViewList);

    this.sizer.addSpacing(6);
    this.sizer.add(this.reScreenCheckbox);
    
	this.sizer.addSpacing(6);

	var buttonSizer = new HorizontalSizer;
	buttonSizer.spacing = 6;
	buttonSizer.addStretch();
	buttonSizer.add(this.executeButton);
	buttonSizer.add(this.cancelButton);
	this.sizer.add(buttonSizer);

    this.adjustToContents();
    this.setFixedSize();
}

StarScreeningDialog.prototype = new Dialog;

function main() {
    var dialog = new StarScreeningDialog();
    dialog.execute();
}

main();