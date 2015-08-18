/*****************************************************************************/
/* Correlator Publish Functions
/*****************************************************************************/

// Meteor.publish('correlator', function(sigNames, topN) {
// var s = "<--- publish correlator in server/publish/correlator.js";
//
// var nameList = [];
// if (sigNames) {
// for (var i = 0, length = sigNames.length; i < length; i++) {
// var sigName = sigNames[i];
// var fields = sigName.split('_v');
// fields.pop();
// var rootName = fields.join('_v');
// nameList.push(rootName);
// }
// }
//
// var findResult = Correlator.find({
// 'name_1' : {
// $in : nameList
// }
// });
// console.log('correlator ', sigNames, 'count:', findResult.count(), 'nameList', nameList.join(), s);
// return findResult;
// });

/**
 * Separate correlator event_2's by datatype. Return an object keyed on datatype.
 * @param {Object} correlatorCursor
 */
var separateCorrelatorScoresByDatatype = function(correlatorCursor) {
    var eventsByType = {};
    var correlatorDocs = correlatorCursor.fetch();

    if (correlatorDocs.length == 0) {
        return eventsByType;
    }

    // add pivot event
    var doc = correlatorDocs[0];
    var name = doc["name_1"];
    var datatype = doc["datatype_1"];
    var version = doc["version_1"];
    eventsByType[datatype] = [{
        "name" : name,
        "version" : version
    }];

    // add correlated events
    _.each(correlatorDocs, function(element, index, list) {
        var doc = element;
        name = doc["name_2"];
        datatype = doc["datatype_2"];
        version = doc["version_2"];
        var score = doc["score"];
        if (!eventsByType.hasOwnProperty(datatype)) {
            eventsByType[datatype] = [];
        }
        eventsByType[datatype].push({
            "name" : name,
            "version" : version
        });
    });

    return eventsByType;
};

/**
 * Query correlator collection by mongo "_id" field.
 */
var getCorrelatorCursorByMongoId = function(idList) {
    var cursor = Correlator.find({
        "_id" : {
            "$in" : idList
        }
    });
    return cursor;
};

/**
 * Get top/bottom correlator scores from Mongo collection
 */
var getCorrelatorIds_forDatatype = function(pivotName, pivotDatatype, pivotVersion, datatype_2, ascOrDesc, limit, skip) {
    var direction = (ascOrDesc === "asc") ? 1 : -1;
    // var datatype_2 = "expression";

    var selector = {
        "name_1" : pivotName,
        "datatype_1" : pivotDatatype,
        "version_1" : pivotVersion,
        "datatype_2" : datatype_2
    };

    var options = {
        "fields" : {
            "_id" : 1
        },
        "sort" : {
            "score" : direction
        },
        "limit" : limit,
        "skip" : skip
    };

    var cursor = Correlator.find(selector, options);

    var docs = cursor.fetch();
    var ids = _.pluck(docs, "_id");

    return ids;
};

var getCorrelatorIds_forExpr = function(pivotName, pivotDatatype, pivotVersion, ascOrDesc, limit, skip) {
    var ids = getCorrelatorIds_forDatatype(pivotName, pivotDatatype, pivotVersion, "expression", ascOrDesc, limit, skip);
    return ids;
};

var getCorrelatorIds_forSign = function(pivotName, pivotDatatype, pivotVersion) {
    var selector = {
        "name_1" : pivotName,
        "datatype_1" : pivotDatatype,
        "version_1" : pivotVersion,
        "datatype_2" : "signature"
    };

    var options = {
        "fields" : {
            "_id" : 1,
            "name_2" : 1
        },
        "sort" : {
            "score" : -1
        }
    };

    var cursor = Correlator.find(selector, options);

    var docs = cursor.fetch();
    var ids = _.pluck(docs, "_id");

    return ids;
};

/**
 * correlatorResults publication
 */
Meteor.publish("correlatorResults", function(pivotName, pivotDatatype, pivotVersion, Study_ID, pagingConfig) {
    var s = "<--- publish correlatorResults in server/publish/correlator.js";
    var pageSize = 5;
    var cursors = [];

    // clinical events
    var clinicalEventsCursor = ClinicalEvents.find({
        "study" : Study_ID
    });
    cursors.push(clinicalEventsCursor);

    console.log("arguments", pivotName, pivotDatatype, pivotVersion, Study_ID, pagingConfig, s);

    // get correlator scores from Mongo collection
    if (pivotDatatype !== "clinical") {
        // unexpected versioning
        pivotVersion = 5;
    }

    // possible datatypes from pagingConfig parameter
    var datatypes = ["expression data", "kinase target activity", "tf target activity", "expression signature"];

    var skipCount = {};
    _.each(datatypes, function(element, index, list) {
        var datatype = element;
        skipCount[datatype] = {
            "head" : 0,
            "tail" : 0
        };
    });

    _.each(_.keys(skipCount), function(element, index, list) {
        var datatype = element;
        if (pagingConfig.hasOwnProperty(datatype)) {
            var datatypePaging = pagingConfig[datatype];
            skipCount[datatype]["head"] = pageSize * datatypePaging["head"];
            skipCount[datatype]["tail"] = pageSize * datatypePaging["tail"];
        }
    });

    var correlatorIds = [];

    // expression correlator _ids
    var expr_ids_top = getCorrelatorIds_forExpr(pivotName, pivotDatatype, pivotVersion, "desc", pageSize, skipCount["expression data"]["head"]);
    var expr_ids_bottom = getCorrelatorIds_forExpr(pivotName, pivotDatatype, pivotVersion, "asc", pageSize, skipCount["expression data"]["tail"]);

    correlatorIds = correlatorIds.concat(expr_ids_top, expr_ids_bottom);

    // TODO signature correlator _ids
    var sig_ids = getCorrelatorIds_forSign(pivotName, pivotDatatype, pivotVersion);

    correlatorIds = correlatorIds.concat(sig_ids);

    // get correlator scores
    var correlatorCursor = getCorrelatorCursorByMongoId(correlatorIds);
    cursors.push(correlatorCursor);
    console.log("correlatorCursor", correlatorCursor.fetch().length, s);

    // separate correlator scores by datatype
    var eventsByType = separateCorrelatorScoresByDatatype(correlatorCursor);

    // console.log("eventsByType", eventsByType, s);

    // get expression values from Mongo collection
    if (eventsByType.hasOwnProperty("expression")) {
        var corrExpEvents = eventsByType["expression"];
        var geneList = _.pluck(corrExpEvents, "name");
        console.log("geneList", geneList.length, s);
        var expression2Cursor = Expression2.find({
            'gene' : {
                "$in" : geneList
            },
            'Study_ID' : Study_ID
        });
        cursors.push(expression2Cursor);

        var mutationsCursor = Mutations.find({
            "MA_FImpact" : {
                "$in" : ["medium", "high"]
            },
            "Study_ID" : Study_ID,
            "Hugo_Symbol" : {
                "$in" : geneList
            }
        });
        cursors.push(mutationsCursor);
    }

    // get signature scores from Mongo collection
    if (eventsByType.hasOwnProperty("signature")) {
        var corrSigEvents = eventsByType["signature"];
        var sigNames = _.map(corrSigEvents, function(element) {
            var name = element["name"];
            var version = element["version"];
            return name + "_v" + version;
        });

        console.log("sigNames", sigNames.length, s);
        var signatureScoresCursor = SignatureScores.find({
            'name' : {
                "$in" : sigNames
            }
        });
        cursors.push(signatureScoresCursor);
    } else {
        var signatureScoresCursor = SignatureScores.find({
            'name' : {
                "$in" : ["MAP3K8_kinase_viper_v5", "AURKB_kinase_viper_v5"]
            }
        });
        cursors.push(signatureScoresCursor);
    }

    console.log("cursors", cursors.length, pivotName, s);

    return cursors;
});
