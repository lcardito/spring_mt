function parseXml(xml) {
	//Remove pretty print whitespace first!
	xml = xml.replace(/\s*(<|>)\s*/g, '$1');
	var xmlDocument;
	if (window.DOMParser) {
		var parser = new DOMParser();
		xmlDocument = parser.parseFromString(xml,"text/xml");
	} else {
		xmlDocument = new ActiveXObject("Microsoft.XMLDOM");
		xmlDocument.loadXML(xml);
	}
	return xmlDocument;
}

function simpleXmlContent(xmlElement) {
	for (var i = 0; i < xmlElement.childNodes.length; i++) {
		if (xmlElement.childNodes[i].nodeType !== Node.TEXT_NODE) {
			return false;
		}
	}
	return true;
}

function inXmlArray(xmlElement) {
	var sibling = xmlElement.nextSibling;
	while (sibling !== null) {
		if (sibling.nodeName !== xmlElement.nodeName) {
			return false;
		}
		sibling = sibling.nextSibling;
	}
	sibling = xmlElement.previousSibling;
	while (sibling !== null) {
		if (sibling.nodeName !== xmlElement.nodeName) {
			return false;
		}
		sibling = sibling.previousSibling;
	}
	return true;
}