const fs = require('fs-extra');
const ejs = require('ejs');
const argv = require('yargs-parser')(process.argv.slice(2));
const path = require('path');



const main = () => {
    console.log('Current Dir : ', __dirname);

    // extract values
    const package = argv._[0];
    const entity = argv._[1];
    const entity_json_path = argv._[2];

    if (!package || !entity) {
        console.error('package and entity are required. e.g tech.meliora.test EntityName');
        process.exit();
    }

    const objectName = entity.charAt(0).toLowerCase() + entity.slice(1);
    const entityAPI = objectName.replace(/([A-Z])/g, '_$1').trim().toLowerCase();
    const dateNow = new Date();
    let dateFormat = {
        year: "numeric", month: "2-digit",
        day: "2-digit", hour: "2-digit", minute: "2-digit",
        second: "2-digit"
    };
    const changeLogId = `${dateNow.getFullYear()}${('0' + (dateNow.getMonth() + 1)).slice(-2)}${('0' + dateNow.getDate()).slice(-2)}${('0' + dateNow.getHours()).slice(-2)}${('0' + dateNow.getMinutes()).slice(-2)}${('0' + dateNow.getSeconds()).slice(-2)}`

    // const changeLogId = dateNow.toLocaleTimeString('en-us', dateFormat);

    var objectFields;
    console.log('entity_json_path : ', entity_json_path);

    if (entity_json_path) {
        objectFields = JSON.parse(fs.readFileSync(entity_json_path));
    }

    objectFields = setFieldColumns(objectFields);


    console.log('objectFields : ', objectFields);
    // return;



    const data = {
        package,
        entity,
        objectName,
        entityAPI,
        changeLogId,
        objectFields
    };

    const options = {};

    // render domain
    console.log('\n\nDomain:\n--------------------');
    const domainTemplateFilename = path.join(__dirname, "./templates/domain.java.ejs")
    render(domainTemplateFilename, data, options);

    

    // render repo
    // console.log('\n\nRepo\n--------------------:');
    // const repoTemplateFilename = path.join(__dirname, "./templates/jparepo.java.ejs")
    // render(repoTemplateFilename, data, options);

    // render liquibase
    console.log('\n\Liquibase Changelog:\n--------------------');
    const liquibaseTemplateFilename = path.join(__dirname, "./templates/liquibase.xml.ejs")
    render(liquibaseTemplateFilename, data, options);

    // render service
    console.log('\n\nService:\n--------------------');
    const serviceTemplateFilename = path.join(__dirname, "./templates/service.java.ejs")
    render(serviceTemplateFilename, data, options);

    // render controller
    console.log('\n\nController:\n--------------------');
    const controllerTemplateFilename = path.join(__dirname, "./templates/controller.java.ejs");
    render(controllerTemplateFilename, data, options);

}


function render(templateFilename, data, options) {
    ejs.renderFile(templateFilename, data, options, function (err, str) {
        if (err) {
            console.error(err);
        }

        console.log(str);
    });
}


function setFieldColumns(objectFields){
    objectFields.forEach(objectField => {
        objectField.column = objectField.field.replace(/([A-Z])/g, '_$1').trim().toLowerCase();
    });

    return objectFields;
}

main();