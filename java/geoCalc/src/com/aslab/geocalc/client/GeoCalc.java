package com.aslab.geocalc.client;

import org.timepedia.exporter.client.ExporterUtil;

import com.google.gwt.core.client.EntryPoint;

public class GeoCalc implements EntryPoint {
	public void onModuleLoad() {
		ExporterUtil.exportAll();
	} 
}

