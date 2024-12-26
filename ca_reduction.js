// Chromatic Aberration Reduction script for PixInsight
// Description: This script will split the image into separate RGB channels,
// align the channels, and recombine them to reduce chromatic aberration
//
// Author: Rumen Bogdanovski
// Date: 2024-12-26

#feature-id    Image Processing > Chromatic Aberration Reduction
#feature-info  Chromatic Aberration Reduction script with UI for PixInsight
#feature-icon  :process-interface-icon


#include <pjsr/Sizer.jsh>
#include <pjsr/FrameStyle.jsh>
#include <pjsr/SectionBar.jsh>

var VERSION = "0.2";

function reduceCA(view) {
	var width = view.image.width;
	var height = view.image.height;
	var numberOfChannels = view.image.numberOfChannels;

	var originalImage = view.image;
	var originalView = view;

	if (numberOfChannels != 3) {
		console.criticalln("View \'"+ originalView.id  +"\' must be a RGB image!");
		return;
	}

	var R = new ImageWindow(width, height, 1, 32, true, false, "R");
	var G = new ImageWindow(width, height, 1, 32, true, false, "G");
	var B = new ImageWindow(width, height, 1, 32, true, false, "B");

	// Extract the Red channel
	originalImage.selectedChannel = 0;
	R.mainView.beginProcess();
	R.mainView.image.assign(originalImage);
	R.mainView.endProcess();

	// Extract the Green channel
	originalImage.selectedChannel = 1;
	G.mainView.beginProcess();
	G.mainView.image.assign(originalImage);
	G.mainView.endProcess();

	// Extract the Blue channel
	originalImage.selectedChannel = 2;
	B.mainView.beginProcess();
	B.mainView.image.assign(originalImage);
	B.mainView.endProcess();

	// Star alignment using Green channel as reference
	var starAlignment = new StarAlignment;

	G.mainView.id = originalView.id+"_G";
	G.show();
	starAlignment.referenceImage = G.mainView.id;

	starAlignment.executeOn(R.mainView);
	var R2 = ImageWindow.activeWindow;
	R2.mainView.id = originalView.id+"_R";

	starAlignment.executeOn(B.mainView);
	var B2 = ImageWindow.activeWindow;
	B2.mainView.id = originalView.id+"_B";

	let channelCombination = new ChannelCombination();
	channelCombination.colorSpace = ChannelCombination.prototype.RGB;

	console.writeln("Reconstricting RGB image with reduced CA...");
	channelCombination.executeOn(originalView);

	// Clean up
	B2.forceClose();
	R2.forceClose();
	R.forceClose();
	G.forceClose();
	B.forceClose();

	console.writeln("CA Reduction of \'" + originalView.id + "\' completed.");
}

function SelectViewDialog() {
	this.__base__ = Dialog;
	this.__base__();

	this.descriptionLabel = new Label(this);
	this.descriptionLabel.text = 
	    "The script will split the image into separate RGB\n" +
		"channels, align the channels, and recombine them\n" +
		"to reduce chromatic aberration.\n" +
		"\nThis script requires 3 channel RGB image.\n" +
		"\nThis script will modify the original image.\n" +
		"\nVersion: " + VERSION + "\n" +
		"Copyright ©2024 by Rumen Bogdanovski\n" +
		"e-mail: rumenastro@gmail.com";
	this.descriptionLabel.textAlignment = TextAlign_VertCenter;

	this.descriptionFrame = new Frame(this);
	this.descriptionFrame.frameStyle = FrameStyle_Box;
	this.descriptionFrame.sizer = new VerticalSizer;
	this.descriptionFrame.sizer.margin = 6;
	this.descriptionFrame.sizer.add(this.descriptionLabel);

	this.selectViewLabel = new Label(this);
	this.selectViewLabel.text = "Select View:";
	this.selectViewLabel.textAlignment = TextAlign_Left | TextAlign_VertCenter;

	this.viewList = new ViewList(this);
	this.viewList.getAll();

	this.okButton = new PushButton(this);
	this.okButton.text = "Execute";
	this.okButton.onClick = function() {
		let selectedView = this.dialog.viewList.currentView;
		if (selectedView.id == "") {
			console.criticalln("You must select a view!");
			return;
		}	
		
		reduceCA(selectedView);
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
	this.sizer.add(this.selectViewLabel);
	this.sizer.add(this.viewList);

	this.sizer.addSpacing(6);

	var buttonSizer = new HorizontalSizer;
	buttonSizer.spacing = 6;
	buttonSizer.addStretch();
	buttonSizer.add(this.okButton);
	buttonSizer.add(this.cancelButton);
	this.sizer.add(buttonSizer);

	this.adjustToContents();
    this.setFixedSize();

	this.windowTitle = "Chromatic Aberration Reduction";
}

SelectViewDialog.prototype = new Dialog;

function main() {
	var dialog = new SelectViewDialog();
	dialog.execute();
}

main();
