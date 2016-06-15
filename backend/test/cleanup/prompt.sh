while true; do
    read -p "This will destory everything load in copy of test data in your database, and pruge everything in your queue. Are you sure to proceed?[DELETE/n]" yn
    case $yn in
        DELETE ) make install; break;;
        [Nn]* ) exit 1;;
        * ) echo "Please answer yes or no.";;
    esac
done
